// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

interface ICitizenID {
    function isVerified(address user) external view returns (bool);
}

contract DisputeResolver is Initializable, OwnableUpgradeable {
    address public talanton;
    address public citizenIDContract;
    address public politeia;

    struct Dispute {
        address complainant;
        address respondent;
        uint256 amount;
        string reason;
        bool resolved;
        bool approved;
    }

    mapping(uint256 => Dispute) public disputes;
    uint256 public disputeCounter;

    event DisputeFiled(uint256 indexed disputeId, address complainant, address respondent, uint256 amount, string reason);
    event DisputeResolved(uint256 indexed disputeId, bool approved);

    function initialize(address _talanton, address _citizenIDContract, address _politeia) external initializer {
        __Ownable_init(_politeia);
        talanton = _talanton;
        citizenIDContract = _citizenIDContract;
        politeia = _politeia;
    }

    function fileDispute(address respondent, uint256 amount, string calldata reason) external {
        require(ICitizenID(citizenIDContract).isVerified(msg.sender), "Not verified");
        require(amount > 0, "Amount must be greater than 0");
        require(IERC20Upgradeable(talanton).balanceOf(msg.sender) >= amount, "Insufficient balance");
        IERC20Upgradeable(talanton).transferFrom(msg.sender, address(this), amount);
        uint256 disputeId = disputeCounter++;
        disputes[disputeId] = Dispute(msg.sender, respondent, amount, reason, false, false);
        emit DisputeFiled(disputeId, msg.sender, respondent, amount, reason);
    }

    function resolveDispute(uint256 disputeId, bool approve) external onlyOwner {
        Dispute storage dispute = disputes[disputeId];
        require(!dispute.resolved, "Dispute already resolved");
        dispute.resolved = true;
        dispute.approved = approve;
        if (approve) {
            IERC20Upgradeable(talanton).transfer(dispute.respondent, dispute.amount);
        } else {
            IERC20Upgradeable(talanton).transfer(dispute.complainant, dispute.amount);
        }
        emit DisputeResolved(disputeId, approve);
    }
}
