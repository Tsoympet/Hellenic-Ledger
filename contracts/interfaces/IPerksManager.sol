// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IPerksManager {
    function updateBoost(address user, uint256 amount) external;
    function getVotingBoost(address user) external view returns (uint256);
}
