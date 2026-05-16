// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title KAIToken
/// @notice The KAI ERC20 token used as collateral and quote currency for HEAT markets.
/// @dev Anyone may call mint(). This is intentional for local/test deployments so the
///      UI can offer a "Get Test KAI" faucet button. Replace with restricted minting
///      (e.g. role-gated bridge or vesting) before any mainnet deployment.
contract KAIToken is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 10_000 ether;

    constructor(address initialOwner)
        ERC20("Kai", "KAI")
        Ownable(initialOwner)
    {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Convenience faucet — mints FAUCET_AMOUNT to caller.
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
