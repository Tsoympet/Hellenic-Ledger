// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IRelicNFT {
    function mint(address to) external;
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}
