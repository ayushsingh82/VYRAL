// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title VyralMarket
/// @notice A leverage market on the "popularity" of a single subject (e.g. "Mr Beast").
///         Users post VYR collateral, choose long/short and leverage (1x..MAX_LEVERAGE),
///         and earn or lose VYR as the mark price moves. One position per user per market.
contract VyralMarket {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------------
    // Constants
    // ---------------------------------------------------------------------
    uint8 public constant MAX_LEVERAGE = 20;
    /// @notice Liquidation triggers when unrealised loss >= LIQUIDATION_THRESHOLD_BPS of collateral.
    uint16 public constant LIQUIDATION_THRESHOLD_BPS = 9500; // 95%
    /// @notice Bounty paid to liquidator, in bps of seized collateral.
    uint16 public constant LIQUIDATION_BOUNTY_BPS = 500; // 5%
    uint16 public constant BPS_DENOMINATOR = 10_000;
    /// @notice Price decimals (1e18). All VYR amounts use 1e18 as well.
    uint256 public constant PRICE_SCALE = 1e18;

    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------
    struct Position {
        uint128 collateral;   // VYR collateral posted (1e18)
        uint128 size;         // notional size in VYR (collateral * leverage)
        uint128 entryPrice;   // mark price at open (1e18)
        uint8 leverage;       // 1..MAX_LEVERAGE
        bool isLong;          // true = long, false = short
        bool open;            // false once closed/liquidated
    }

    IERC20 public immutable vyr;
    address public immutable factory;
    address public oracle;

    string public subject;
    string public category;
    string public imageUrl;

    uint256 public markPrice;       // 1e18-scaled
    uint256 public longOI;          // sum of long sizes (notional VYR)
    uint256 public shortOI;         // sum of short sizes (notional VYR)
    uint256 public volumeAccum;     // lifetime traded notional
    uint256 public insuranceFund;   // VYR held by protocol to back profitable PnL

    mapping(address => Position) public positions;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------
    event PositionOpened(
        address indexed user,
        bool isLong,
        uint128 collateral,
        uint128 size,
        uint128 entryPrice,
        uint8 leverage
    );
    event PositionClosed(
        address indexed user,
        uint128 exitPrice,
        int256 pnl,
        uint128 payout
    );
    event PositionLiquidated(
        address indexed user,
        address indexed liquidator,
        uint128 exitPrice,
        uint128 bounty
    );
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event OracleUpdated(address oldOracle, address newOracle);
    event InsuranceFunded(address indexed from, uint256 amount, uint256 newBalance);

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------
    modifier onlyOracle() {
        require(msg.sender == oracle, "VyralMarket: not oracle");
        _;
    }

    constructor(
        address vyr_,
        address oracle_,
        address factory_,
        string memory subject_,
        string memory category_,
        string memory imageUrl_,
        uint256 initialPrice
    ) {
        require(vyr_ != address(0), "VyralMarket: zero vyr");
        require(oracle_ != address(0), "VyralMarket: zero oracle");
        require(initialPrice > 0, "VyralMarket: zero price");
        vyr = IERC20(vyr_);
        oracle = oracle_;
        factory = factory_;
        subject = subject_;
        category = category_;
        imageUrl = imageUrl_;
        markPrice = initialPrice;
    }

    // ---------------------------------------------------------------------
    // Oracle / admin
    // ---------------------------------------------------------------------
    function updatePrice(uint256 newPrice) external onlyOracle {
        require(newPrice > 0, "VyralMarket: zero price");
        emit PriceUpdated(markPrice, newPrice);
        markPrice = newPrice;
    }

    function setOracle(address newOracle) external onlyOracle {
        require(newOracle != address(0), "VyralMarket: zero oracle");
        emit OracleUpdated(oracle, newOracle);
        oracle = newOracle;
    }

    /// @notice Anyone may donate VYR to the insurance fund. Without a counterparty pool,
    ///         profitable trades must be paid out from somewhere — this is that pool.
    ///         Losing trades increase the fund implicitly via forfeited collateral.
    function fundInsurance(uint256 amount) external {
        require(amount > 0, "VyralMarket: zero amount");
        vyr.safeTransferFrom(msg.sender, address(this), amount);
        insuranceFund += amount;
        emit InsuranceFunded(msg.sender, amount, insuranceFund);
    }

    // ---------------------------------------------------------------------
    // Trading
    // ---------------------------------------------------------------------
    function openPosition(uint128 collateral, uint8 leverage, bool isLong) external {
        require(collateral > 0, "VyralMarket: zero collateral");
        require(leverage >= 1 && leverage <= MAX_LEVERAGE, "VyralMarket: bad leverage");
        Position storage p = positions[msg.sender];
        require(!p.open, "VyralMarket: position exists");

        uint128 size = collateral * leverage;

        vyr.safeTransferFrom(msg.sender, address(this), collateral);

        p.collateral = collateral;
        p.size = size;
        p.entryPrice = uint128(markPrice);
        p.leverage = leverage;
        p.isLong = isLong;
        p.open = true;

        if (isLong) {
            longOI += size;
        } else {
            shortOI += size;
        }
        volumeAccum += size;

        emit PositionOpened(msg.sender, isLong, collateral, size, uint128(markPrice), leverage);
    }

    function closePosition() external {
        Position storage p = positions[msg.sender];
        require(p.open, "VyralMarket: no position");

        (int256 pnl, uint128 payout) = _settleRaw(p);
        // insurance delta: collateral - payout. Positive on user loss, negative on user gain.
        int256 insuranceDelta = int256(uint256(p.collateral)) - int256(uint256(payout));
        if (insuranceDelta >= 0) {
            insuranceFund += uint256(insuranceDelta);
        } else {
            uint256 owed = uint256(-insuranceDelta);
            require(insuranceFund >= owed, "VyralMarket: insurance underfunded");
            insuranceFund -= owed;
        }

        _bookOIClose(p);
        p.open = false;

        if (payout > 0) {
            vyr.safeTransfer(msg.sender, payout);
        }

        emit PositionClosed(msg.sender, uint128(markPrice), pnl, payout);
    }

    /// @notice Anyone can liquidate an underwater position. Liquidator receives a bounty.
    function liquidate(address user) external {
        Position storage p = positions[user];
        require(p.open, "VyralMarket: no position");
        require(_isLiquidatable(p), "VyralMarket: not liquidatable");

        ( , uint128 payout) = _settleRaw(p);

        // Bounty: paid from the forfeited portion of collateral.
        uint128 forfeit = p.collateral - payout;
        uint128 bounty = uint128((uint256(forfeit) * LIQUIDATION_BOUNTY_BPS) / BPS_DENOMINATOR);

        // Whatever isn't paid to user or liquidator goes to insurance fund.
        insuranceFund += uint256(forfeit - bounty);

        _bookOIClose(p);
        p.open = false;

        if (payout > 0) {
            vyr.safeTransfer(user, payout);
        }
        if (bounty > 0) {
            vyr.safeTransfer(msg.sender, bounty);
        }

        emit PositionLiquidated(user, msg.sender, uint128(markPrice), bounty);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------
    struct MarketSnapshot {
        uint256 markPrice;
        uint256 longOI;
        uint256 shortOI;
        uint256 longPctBps;   // 0..10000
        uint256 shortPctBps;  // 0..10000
        uint256 volumeAccum;
    }

    function getMarketSnapshot() external view returns (MarketSnapshot memory s) {
        s.markPrice = markPrice;
        s.longOI = longOI;
        s.shortOI = shortOI;
        s.volumeAccum = volumeAccum;
        uint256 total = longOI + shortOI;
        if (total == 0) {
            s.longPctBps = 5000;
            s.shortPctBps = 5000;
        } else {
            s.longPctBps = (longOI * BPS_DENOMINATOR) / total;
            s.shortPctBps = BPS_DENOMINATOR - s.longPctBps;
        }
    }

    struct PositionView {
        bool open;
        bool isLong;
        uint8 leverage;
        uint128 collateral;
        uint128 size;
        uint128 entryPrice;
        int256 unrealizedPnl;
        bool liquidatable;
    }

    function getPosition(address user) external view returns (PositionView memory v) {
        Position storage p = positions[user];
        v.open = p.open;
        v.isLong = p.isLong;
        v.leverage = p.leverage;
        v.collateral = p.collateral;
        v.size = p.size;
        v.entryPrice = p.entryPrice;
        if (p.open) {
            v.unrealizedPnl = _pnl(p);
            v.liquidatable = _isLiquidatable(p);
        }
    }

    // ---------------------------------------------------------------------
    // Internal
    // ---------------------------------------------------------------------
    function _pnl(Position storage p) internal view returns (int256) {
        // pnl = size * (mark - entry) / entry  (longs); inverted for shorts.
        int256 diff = int256(uint256(markPrice)) - int256(uint256(p.entryPrice));
        if (!p.isLong) diff = -diff;
        return (int256(uint256(p.size)) * diff) / int256(uint256(p.entryPrice));
    }

    function _isLiquidatable(Position storage p) internal view returns (bool) {
        int256 pnl = _pnl(p);
        if (pnl >= 0) return false;
        uint256 loss = uint256(-pnl);
        uint256 threshold = (uint256(p.collateral) * LIQUIDATION_THRESHOLD_BPS) / BPS_DENOMINATOR;
        return loss >= threshold;
    }

    function _settleRaw(Position storage p) internal view returns (int256 pnl, uint128 payout) {
        pnl = _pnl(p);
        int256 net = int256(uint256(p.collateral)) + pnl;
        if (net <= 0) {
            payout = 0;
        } else if (uint256(net) > type(uint128).max) {
            payout = type(uint128).max;
        } else {
            payout = uint128(uint256(net));
        }
    }

    function _bookOIClose(Position storage p) internal {
        if (p.isLong) {
            longOI -= p.size;
        } else {
            shortOI -= p.size;
        }
    }
}
