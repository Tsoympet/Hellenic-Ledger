// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IHellenicPoliteia {
    function pause() external;
    function unpause() external;
    function transferEcosystemOwnership() external;
    function startElection(string calldata role, address candidate) external;
    function voteForRole(string calldata role, uint256 electionId) external;
    function finalizeElections(string calldata role) external;
    function proposeSilverMotion(string calldata description, uint256 newStakeRate, uint256 newMiningRate, bytes calldata actionData) external;
    function voteForMotion(uint256 motionId, bool inFavor) external;
    function executeSilverMotion(uint256 motionId) external;
    function vetoSilverMotion(uint256 motionId) external;
    function removeAndBanMember(address member, string calldata role, string calldata reason, bytes[] calldata signatures) external;
    function updateFame(address member, int256 fameAdjustment, string calldata reason) external;
    function triggerEmergencyPause(bytes[] calldata signatures) external;
    function endEmergencyPause() external;
    function setEmergencyCondition(string calldata reason, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt) external;
    function executeEmergencyCondition(uint256 conditionId, address recipient, bytes[] calldata signatures) external;
    function distributeRevenue(uint256 startIndex, uint256 batchSize) external;
    function withdrawLegalDefense(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) external;
    function withdrawSidechainDev(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) external;
    function withdrawFullChainDev(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) external;
    function withdrawCharity(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) external;
    function withdrawEmergency(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) external;

    function fameScore(address member) external view returns (uint256);
    function bannedFromElection(address member) external view returns (bool);
}
