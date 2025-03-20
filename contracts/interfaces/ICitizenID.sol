// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICitizenID {
    function isVerified(address user) external view returns (bool);
    function verifyUser(address user) external;
    function revokeVerification(address user) external;
}
