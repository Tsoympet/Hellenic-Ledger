// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IOracle {
    function updatePrice(address token, uint256 price) external;
    function getPrice(address token) external view returns (uint256);
}
