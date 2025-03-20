// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Oracle is Initializable, OwnableUpgradeable {
    mapping(address => uint256) public prices;

    event PriceUpdated(address indexed token, uint256 price);

    function initialize() external initializer {
        __Ownable_init(msg.sender);
    }

    function updatePrice(address token, uint256 price) external onlyOwner {
        prices[token] = price;
        emit PriceUpdated(token, price);
    }

    function getPrice(address token) external view returns (uint256) {
        return prices[token];
    }
}
