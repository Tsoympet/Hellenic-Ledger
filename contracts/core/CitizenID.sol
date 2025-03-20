// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CitizenID is Initializable, OwnableUpgradeable {
    address public politeia;
    mapping(address => bool) public isVerified;

    event UserVerified(address indexed user);
    event VerificationRevoked(address indexed user);

    function initialize(address _politeia) external initializer {
        __Ownable_init(_politeia);
        politeia = _politeia;
    }

    function verifyUser(address user) external onlyOwner {
        require(user != address(0), "Invalid address");
        isVerified[user] = true;
        emit UserVerified(user);
    }

    function revokeVerification(address user) external onlyOwner {
        require(user != address(0), "Invalid address");
        isVerified[user] = false;
        emit VerificationRevoked(user);
    }
}
