// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITalanton {
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function mine(bytes32 hash) external;
    function updateRewardRate(uint256 newStakeRate, uint256 newMiningRate) external;
    function updateDecayFactor(uint256 newFactor) external;
    function pause() external;
    function unpause() external;
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function titanicMints(address user) external view returns (uint256);
    function stakedBalance(address user) external view returns (uint256);
    function calculateStakingReward(address user) external view returns (uint256);
}
