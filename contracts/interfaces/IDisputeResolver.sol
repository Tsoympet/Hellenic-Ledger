// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IDisputeResolver {
    function fileDispute(address respondent, uint256 amount, string calldata reason) external;
    function resolveDispute(uint256 disputeId, bool approve) external;
}
