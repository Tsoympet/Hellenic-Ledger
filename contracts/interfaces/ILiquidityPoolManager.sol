// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ILiquidityPoolManager {
    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external;
}
