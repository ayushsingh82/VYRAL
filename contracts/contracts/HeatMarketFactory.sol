// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {HeatMarket} from "./HeatMarket.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title HeatMarketFactory
/// @notice Deploys and indexes HeatMarket instances. Owned by a deployer that can
///         seed markets; in production this would be replaced by governance.
contract HeatMarketFactory is Ownable {
    address public immutable kai;
    address public oracle;

    address[] public allMarkets;
    mapping(string => address[]) private _marketsByCategory;
    mapping(address => bool) public isMarket;

    event MarketCreated(
        address indexed market,
        string subject,
        string category,
        string imageUrl,
        uint256 initialPrice
    );
    event OracleUpdated(address oldOracle, address newOracle);

    constructor(address kai_, address oracle_, address initialOwner)
        Ownable(initialOwner)
    {
        require(kai_ != address(0), "Factory: zero kai");
        require(oracle_ != address(0), "Factory: zero oracle");
        kai = kai_;
        oracle = oracle_;
    }

    function setOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Factory: zero oracle");
        emit OracleUpdated(oracle, newOracle);
        oracle = newOracle;
    }

    function createMarket(
        string calldata subject,
        string calldata category,
        string calldata imageUrl,
        uint256 initialPrice
    ) external onlyOwner returns (address market) {
        HeatMarket m = new HeatMarket(
            kai,
            oracle,
            address(this),
            subject,
            category,
            imageUrl,
            initialPrice
        );
        market = address(m);
        allMarkets.push(market);
        _marketsByCategory[category].push(market);
        isMarket[market] = true;
        emit MarketCreated(market, subject, category, imageUrl, initialPrice);
    }

    function allMarketsLength() external view returns (uint256) {
        return allMarkets.length;
    }

    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    function getMarketsByCategory(string calldata category) external view returns (address[] memory) {
        return _marketsByCategory[category];
    }
}
