// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function pause() external;
    function unpause() external;
    function transferOwnership(address newOwner) external;
}

interface IPerksManager {
    function getVotingBoost(address user) external view returns (uint256);
}

interface ITalanton {
    function updateRewardRate(uint256 newStakeRate, uint256 newMiningRate) external;
    function updateDecayFactor(uint256 newFactor) external;
    function titanicMints(address user) external view returns (uint256);
    function stakedBalance(address user) external view returns (uint256); // Added
    function calculateStakingBonus(address user) external view returns (uint256); // Added
}

contract HellenicPoliteia is Initializable, ReentrancyGuardUpgradeable, OwnableUpgradeable, PausableUpgradeable {
    address public citizenIDContract;
    address public talantonContract;
    address public drachmaContract;
    address public obolosContract;
    address public perksManagerContract;

    address public archon;
    address[] public strategoi;
    address[] public prytaneis;
    address[] public grammateis;
    address[] public demos;
    address[4] public eponymousHeroes;

    uint256 public charityVaultTalanton;
    uint256 public charityVaultDrachma;
    uint256 public charityVaultObolos;
    uint256 public emergencyVaultTalanton;
    uint256 public emergencyVaultDrachma;
    uint256 public emergencyVaultObolos;
    uint256 public sidechainDevVaultTalanton;
    uint256 public sidechainDevVaultDrachma;
    uint256 public sidechainDevVaultObolos;
    uint256 public fullChainDevVaultTalanton;
    uint256 public fullChainDevVaultDrachma;
    uint256 public fullChainDevVaultObolos;
    uint256 public legalDefenseVaultTalanton;
    uint256 public legalDefenseVaultDrachma;
    uint256 public legalDefenseVaultObolos;

    uint256 public constant HERO_TALANTON = 100 * 10**18;
    uint256 public constant HERO_DRACHMA = 1000000 * 10**18;
    uint256 public constant HERO_OBOLOS = 5000000 * 10**18;
    uint256 public constant DEMOS_TALANTON = 0.5 * 10**18;
    uint256 public constant DEMOS_DRACHMA = 5000 * 10**18;
    uint256 public constant DEMOS_OBOLOS = 25000 * 10**18;
    uint256 public constant STRATEGOS_TALANTON = 10 * 10**18;
    uint256 public constant STRATEGOS_DRACHMA = 100000 * 10**18;
    uint256 public constant STRATEGOS_OBOLOS = 500000 * 10**18;
    uint256 public constant PRYTANIS_TALANTON = 1 * 10**18;
    uint256 public constant PRYTANIS_DRACHMA = 10000 * 10**18;
    uint256 public constant PRYTANIS_OBOLOS = 50000 * 10**18;
    uint256 public constant GRAMMATEUS_TALANTON = 5 * 10**18;
    uint256 public constant GRAMMATEUS_DRACHMA = 50000 * 10**18;
    uint256 public constant GRAMMATEUS_OBOLOS = 250000 * 10**18;
    uint256 public constant ARCHON_TALANTON = 50 * 10**18;
    uint256 public constant ARCHON_DRACHMA = 500000 * 10**18;
    uint256 public constant ARCHON_OBOLOS = 2500000 * 10**18;

    uint256 public constant REQUIRED_STRATEGOS_SIGNATURES = 3;
    uint256 public constant REQUIRED_VOTE_PERCENTAGE = 20;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant DEMOS_SIZE = 500;
    uint256 public constant STRATEGOS_SIZE = 10;
    uint256 public constant PRYTANIS_SIZE = 50;
    uint256 public constant GRAMMATEUS_SIZE = 25;
    uint256 public constant ARCHON_SIZE = 1;
    uint256 public constant FAME_THRESHOLD = 50;

    uint256 public lastPayout;
    bool public emergencyPauseActive;
    uint256 public pauseEndTime;
    uint256 public cachedVotingPower;
    uint256 public lastVotingPowerUpdate;
    bool public foundersHandoverComplete;

    mapping(address => uint256) public fameScore;
    mapping(address => bool) public bannedFromElection;

    struct Vote {
        address candidate;
        uint256 votes;
        bool active;
        uint256 endTime;
    }

    struct EmergencyCondition {
        string reason;
        uint256 talantonAmt;
        uint256 drachmaAmt;
        uint256 obolosAmt;
        bool executed;
    }

    struct SilverMotion {
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool active;
        uint256 endTime;
        bool executed;
        uint256 newStakeRate;
        uint256 newMiningRate;
        bytes actionData;
        bool vetoedByArchon;
    }

    mapping(uint256 => Vote) public demosElections;
    mapping(uint256 => Vote) public strategosElections;
    mapping(uint256 => Vote) public prytanisElections;
    mapping(uint256 => Vote) public grammateusElections;
    mapping(uint256 => Vote) public archonElections;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(uint256 => EmergencyCondition) public emergencyConditions;
    mapping(uint256 => SilverMotion) public silverMotions;
    mapping(address => mapping(uint256 => bool)) public hasVotedMotion;
    uint256 public electionCounter;
    uint256 public emergencyCounter;
    uint256 public motionCounter;

    event RevenueDistributed(uint256 timestamp);
    event VaultWithdrawn(string vaultType, address indexed recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt);
    event EmergencyPauseTriggered(uint256 endTime);
    event RoleElected(string role, address indexed member, uint256 votes);
    event ElectionStarted(uint256 electionId, string role, address candidate, uint256 endTime);
    event EmergencyConditionSet(uint256 conditionId, string reason);
    event MotionProposed(uint256 motionId, address indexed proposer, string description);
    event MotionVoted(uint256 motionId, address indexed voter, bool inFavor);
    event MotionExecuted(uint256 motionId, string description);
    event MotionVetoed(uint256 motionId, address indexed archon);
    event EcosystemOwnershipTransferred(address indexed from, address indexed to);
    event HeroSpotTransferred(address indexed from, address indexed to);
    event HeroSpotInherited(address indexed from, address indexed to);
    event FameUpdated(address indexed member, uint256 newFame);
    event MemberRemovedAndBanned(address indexed member, string role, string reason);

    function initialize(
        address _citizenIDContract,
        address _talantonContract,
        address _drachmaContract,
        address _obolosContract,
        address _perksManagerContract,
        address[4] memory _eponymousHeroes
    ) external initializer {
        require(_citizenIDContract != address(0) && _talantonContract != address(0) && _drachmaContract != address(0) && _obolosContract != address(0), "Invalid address");
        require(_perksManagerContract != address(0), "Invalid perks manager");
        __ReentrancyGuard_init();
        __Ownable_init(msg.sender);
        __Pausable_init();
        citizenIDContract = _citizenIDContract;
        talantonContract = _talantonContract;
        drachmaContract = _drachmaContract;
        obolosContract = _obolosContract;
        perksManagerContract = _perksManagerContract;
        eponymousHeroes = _eponymousHeroes;
        lastPayout = block.timestamp;

        uint256 initialTalanton = 50000 * 10**18;
        uint256 initialDrachma = 500000000 * 10**18;
        uint256 initialObolos = 2500000000 * 10**18;
        charityVaultTalanton = initialTalanton * 5 / 100;
        charityVaultDrachma = initialDrachma * 5 / 100;
        charityVaultObolos = initialObolos * 5 / 100;
        emergencyVaultTalanton = initialTalanton * 5 / 100;
        emergencyVaultDrachma = initialDrachma * 5 / 100;
        emergencyVaultObolos = initialObolos * 5 / 100;
        sidechainDevVaultTalanton = initialTalanton * 10 / 100;
        sidechainDevVaultDrachma = initialDrachma * 10 / 100;
        sidechainDevVaultObolos = initialObolos * 10 / 100;
        fullChainDevVaultTalanton = initialTalanton * 10 / 100;
        fullChainDevVaultDrachma = initialDrachma * 10 / 100;
        fullChainDevVaultObolos = initialObolos * 10 / 100;
        legalDefenseVaultTalanton = initialTalanton * 5 / 100;
        legalDefenseVaultDrachma = initialDrachma * 5 / 100;
        legalDefenseVaultObolos = initialObolos * 5 / 100;

        updateVotingPower();
    }

    modifier onlyVerified() {
        (bool success, bytes memory data) = citizenIDContract.staticcall(abi.encodeWithSignature("isVerified(address)", msg.sender));
        require(success && abi.decode(data, (bool)), "Not verified");
        _;
    }

    modifier onlyStrategoi() {
        bool isStrategos = false;
        for (uint i = 0; i < strategoi.length; i++) {
            if (strategoi[i] == msg.sender) {
                isStrategos = true;
                break;
            }
        }
        require(isStrategos, "Not a Strategos");
        _;
    }

    modifier onlyArchon() {
        require(msg.sender == archon, "Not the Archon");
        _;
    }

    modifier onlyHero() {
        bool isHero = false;
        for (uint i = 0; i < 4; i++) {
            if (eponymousHeroes[i] == msg.sender) {
                isHero = true;
                break;
            }
        }
        require(isHero, "Not an Eponymous Hero");
        _;
    }

    function transferEcosystemOwnership() external onlyOwner {
        require(!foundersHandoverComplete, "Handover already completed");
        foundersHandoverComplete = true;

        IERC20(talantonContract).transferOwnership(address(this));
        IERC20(drachmaContract).transferOwnership(address(this));
        IERC20(obolosContract).transferOwnership(address(this));

        uint256 boostTalanton = 5000 * 10**18;
        uint256 boostDrachma = 50000000 * 10**18;
        uint256 boostObolos = 250000000 * 10**18;
        legalDefenseVaultTalanton += boostTalanton;
        legalDefenseVaultDrachma += boostDrachma;
        legalDefenseVaultObolos += boostObolos;
        IERC20(talantonContract).transfer(address(this), boostTalanton);
        IERC20(drachmaContract).transfer(address(this), boostDrachma);
        IERC20(obolosContract).transfer(address(this), boostObolos);

        emit EcosystemOwnershipTransferred(msg.sender, address(this));
    }

    function transferHeroSpot(address newHero) external onlyHero whenNotPaused {
        require(newHero != address(0), "Invalid new hero");
        for (uint i = 0; i < 4; i++) {
            if (eponymousHeroes[i] == msg.sender) {
                eponymousHeroes[i] = newHero;
                emit HeroSpotTransferred(msg.sender, newHero);
                break;
            }
        }
    }

    function inheritHeroSpot(address heir, bytes calldata signature) external whenNotPaused {
        require(heir != address(0), "Invalid heir");
        bytes32 messageHash = keccak256(abi.encodePacked("Inherit", msg.sender, heir, block.timestamp));
        address signer = ECDSAUpgradeable.recover(messageHash, signature);
        bool isHero = false;
        uint heroIndex;
        for (uint i = 0; i < 4; i++) {
            if (eponymousHeroes[i] == signer) {
                isHero = true;
                heroIndex = i;
                break;
            }
        }
        require(isHero, "Signature must be from an Eponymous Hero");
        eponymousHeroes[heroIndex] = heir;
        emit HeroSpotInherited(signer, heir);
    }

    function startElection(string calldata role, address candidate) external onlyVerified whenNotPaused {
        require(!bannedFromElection[candidate], "Candidate is banned");
        require(fameScore[candidate] >= FAME_THRESHOLD || fameScore[candidate] == 0, "Insufficient Fame");
        require(bytes(role).length > 0, "Role cannot be empty");
        require(candidate != address(0), "Invalid candidate");
        uint256 electionId = electionCounter++;
        Vote memory newVote = Vote(candidate, 0, true, block.timestamp + VOTING_PERIOD);
        if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Demos"))) {
            demosElections[electionId] = newVote;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Strategos"))) {
            strategosElections[electionId] = newVote;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Prytanis"))) {
            prytanisElections[electionId] = newVote;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Grammateus"))) {
            grammateusElections[electionId] = newVote;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Archon"))) {
            archonElections[electionId] = newVote;
        } else {
            revert("Invalid role");
        }
        emit ElectionStarted(electionId, role, candidate, newVote.endTime);
    }

    function voteForRole(string calldata role, uint256 electionId) external onlyVerified whenNotPaused {
        require(!hasVoted[msg.sender][electionId], "Already voted");
        Vote storage vote;
        if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Demos"))) {
            vote = demosElections[electionId];
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Strategos"))) {
            vote = strategosElections[electionId];
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Prytanis"))) {
            vote = prytanisElections[electionId];
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Grammateus"))) {
            vote = grammateusElections[electionId];
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Archon"))) {
            vote = archonElections[electionId];
        } else {
            revert("Invalid role");
        }

        require(vote.active && block.timestamp <= vote.endTime, "Election ended");
        uint256 talantonVotes = IERC20(talantonContract).balanceOf(msg.sender) / 10**18 * (ITalanton(talantonContract).titanicMints(msg.sender) > 0 ? 5000 : 1000);
        uint256 obolosVotes = IERC20(obolosContract).balanceOf(msg.sender) / (1000 * 10**18);
        uint256 boost = IPerksManager(perksManagerContract).getVotingBoost(msg.sender);
        uint256 totalVotes = (talantonVotes + obolosVotes) * (boost > 0 ? boost : 1);
        vote.votes += totalVotes;
        hasVoted[msg.sender][electionId] = true;
        emit RoleElected(role, vote.candidate, vote.votes);
    }

    function finalizeElections(string calldata role) external onlyOwner whenNotPaused {
        require(bytes(role).length > 0, "Role cannot be empty");
        uint256 size;
        address[] storage targetArray;
        mapping(uint256 => Vote) storage elections;

        if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Demos"))) {
            size = DEMOS_SIZE;
            targetArray = demos;
            elections = demosElections;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Strategos"))) {
            size = STRATEGOS_SIZE;
            targetArray = strategoi;
            elections = strategosElections;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Prytanis"))) {
            size = PRYTANIS_SIZE;
            targetArray = prytaneis;
            elections = prytanisElections;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Grammateus"))) {
            size = GRAMMATEUS_SIZE;
            targetArray = grammateis;
            elections = grammateusElections;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Archon"))) {
            size = ARCHON_SIZE;
            elections = archonElections;
            Vote storage vote = elections[electionCounter - 1];
            if (vote.active && block.timestamp > vote.endTime) {
                vote.active = false;
                archon = vote.candidate;
                fameScore[vote.candidate] = 100;
                emit RoleElected(role, vote.candidate, vote.votes);
                emit FameUpdated(vote.candidate, 100);
            }
            return;
        } else {
            revert("Invalid role");
        }

        address[] memory topCandidates = new address[](size);
        uint256[] memory topVotes = new uint256[](size);

        for (uint i = 0; i < electionCounter; i++) {
            Vote storage vote = elections[i];
            if (vote.active && block.timestamp > vote.endTime) {
                vote.active = false;
                for (uint j = 0; j < size; j++) {
                    if (vote.votes > topVotes[j]) {
                        for (uint k = size - 1; k > j; k--) {
                            topVotes[k] = topVotes[k - 1];
                            topCandidates[k] = topCandidates[k - 1];
                        }
                        topVotes[j] = vote.votes;
                        topCandidates[j] = vote.candidate;
                        break;
                    }
                }
            }
        }

        delete targetArray;
        for (uint i = 0; i < size; i++) {
            if (topCandidates[i] != address(0)) {
                targetArray.push(topCandidates[i]);
                if (fameScore[topCandidates[i]] == 0) {
                    fameScore[topCandidates[i]] = 100;
                }
                emit FameUpdated(topCandidates[i], fameScore[topCandidates[i]]);
            }
        }
    }

    function removeAndBanMember(address member, string calldata role, string calldata reason, bytes[] calldata signatures) external onlyArchon whenNotPaused {
        require(bytes(reason).length > 0, "Reason required");
        require(signatures.length >= 3, "At least 3 signatures required");
        require(verifySignatures(keccak256(abi.encodePacked("RemoveAndBan", member, role, reason, block.timestamp)), signatures, 3), "Invalid signatures");

        if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Archon"))) {
            require(member == archon, "Invalid Archon");
            archon = address(0);
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Strategos"))) {
            for (uint i = 0; i < strategoi.length; i++) {
                if (strategoi[i] == member) {
                    strategoi[i] = strategoi[strategoi.length - 1];
                    strategoi.pop();
                    break;
                }
            }
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Prytanis"))) {
            for (uint i = 0; i < prytaneis.length; i++) {
                if (prytaneis[i] == member) {
                    prytaneis[i] = prytaneis[prytaneis.length - 1];
                    prytaneis.pop();
                    break;
                }
            }
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Grammateus"))) {
            for (uint i = 0; i < grammateis.length; i++) {
                if (grammateis[i] == member) {
                    grammateis[i] = grammateis[grammateis.length - 1];
                    grammateis.pop();
                    break;
                }
            }
        } else {
            revert("Invalid role");
        }

        bannedFromElection[member] = true;
        fameScore[member] = 0;
        emit MemberRemovedAndBanned(member, role, reason);
        emit FameUpdated(member, 0);
    }

    function updateFame(address member, int256 fameAdjustment, string calldata reason) external onlyArchon whenNotPaused {
        require(bytes(reason).length > 0, "Reason required");
        int256 newFame = int256(fameScore[member]) + fameAdjustment;
        if (newFame < 0) newFame = 0;
        if (newFame > 100) newFame = 100;
        fameScore[member] = uint256(newFame);
        emit FameUpdated(member, uint256(newFame));
    }

    function proposeSilverMotion(string calldata description, uint256 newStakeRate, uint256 newMiningRate, bytes calldata actionData) external onlyVerified whenNotPaused {
        require(IERC20(drachmaContract).balanceOf(msg.sender) >= 1000000 * 10**18, "Stake at least 1M drachmae");
        require(bytes(description).length > 0, "Description cannot be empty");
        uint256 motionId = motionCounter++;
        silverMotions[motionId] = SilverMotion(msg.sender, description, 0, 0, true, block.timestamp + VOTING_PERIOD, false, newStakeRate, newMiningRate, actionData, false);
        emit MotionProposed(motionId, msg.sender, description);
    }

    function voteForMotion(uint256 motionId, bool inFavor) external onlyVerified whenNotPaused {
        require(!hasVotedMotion[msg.sender][motionId], "Already voted");
        SilverMotion storage motion = silverMotions[motionId];
        require(motion.active && block.timestamp <= motion.endTime, "Voting ended");

        uint256 talantonVotes = IERC20(talantonContract).balanceOf(msg.sender) / 10**18 * (ITalanton(talantonContract).titanicMints(msg.sender) > 0 ? 5000 : 1000);
        uint256 obolosVotes = IERC20(obolosContract).balanceOf(msg.sender) / (1000 * 10**18);
        uint256 boost = IPerksManager(perksManagerContract).getVotingBoost(msg.sender);
        uint256 totalVotes = (talantonVotes + obolosVotes) * (boost > 0 ? boost : 1);

        if (inFavor) {
            motion.votesFor += totalVotes;
        } else {
            motion.votesAgainst += totalVotes;
        }
        hasVotedMotion[msg.sender][motionId] = true;
        emit MotionVoted(motionId, msg.sender, inFavor);
    }

    function vetoSilverMotion(uint256 motionId) external onlyArchon whenNotPaused {
        SilverMotion storage motion = silverMotions[motionId];
        require(motion.active && block.timestamp <= motion.endTime, "Voting ended or motion inactive");
        require(!motion.vetoedByArchon, "Already vetoed");
        motion.vetoedByArchon = true;
        motion.active = false;
        emit MotionVetoed(motionId, msg.sender);
    }

    function executeSilverMotion(uint256 motionId) external onlyStrategoi whenNotPaused {
        SilverMotion storage motion = silverMotions[motionId];
        require(motion.active && block.timestamp > motion.endTime, "Voting not ended");
        require(!motion.executed, "Already executed");
        require(!motion.vetoedByArchon, "Motion vetoed by Archon");
        require(motion.votesFor > motion.votesAgainst && motion.votesFor >= REQUIRED_VOTE_PERCENTAGE * cachedVotingPower / 100, "Motion not approved");

        motion.executed = true;
        motion.active = false;
        ITalanton(talantonContract).updateRewardRate(motion.newStakeRate, motion.newMiningRate);
        if (motion.actionData.length > 0) {
            (address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, string memory actionType) = abi.decode(motion.actionData, (address, uint256, uint256, uint256, string));
            if (keccak256(abi.encodePacked(actionType)) == keccak256(abi.encodePacked("SidechainDev"))) {
                withdrawSidechainDev(recipient, talantonAmt, drachmaAmt, obolosAmt, new bytes[](0));
            } else if (keccak256(abi.encodePacked(actionType)) == keccak256(abi.encodePacked("FullChainDev"))) {
                withdrawFullChainDev(recipient, talantonAmt, drachmaAmt, obolosAmt, new bytes[](0));
            } else if (keccak256(abi.encodePacked(actionType)) == keccak256(abi.encodePacked("Marketing"))) {
                withdrawSidechainDev(recipient, talantonAmt, drachmaAmt, obolosAmt, new bytes[](0));
            } else if (keccak256(abi.encodePacked(actionType)) == keccak256(abi.encodePacked("Partnership"))) {
                withdrawSidechainDev(recipient, talantonAmt, drachmaAmt, obolosAmt, new bytes[](0));
            } else if (keccak256(abi.encodePacked(actionType)) == keccak256(abi.encodePacked("Regulation"))) {
                withdrawFullChainDev(recipient, talantonAmt, drachmaAmt, obolosAmt, new bytes[](0));
            } else if (keccak256(abi.encodePacked(actionType)) == keccak256(abi.encodePacked("Lawsuit"))) {
                withdrawLegalDefense(recipient, talantonAmt, drachmaAmt, obolosAmt, new bytes[](0));
            } else if (keccak256(abi.encodePacked(actionType)) == keccak256(abi.encodePacked("Other"))) {
                withdrawFullChainDev(recipient, talantonAmt, drachmaAmt, obolosAmt, new bytes[](0));
            }
            if (talantonAmt > 0) {
                fameScore[motion.proposer] = fameScore[motion.proposer] + 5 > 100 ? 100 : fameScore[motion.proposer] + 5;
                emit FameUpdated(motion.proposer, fameScore[motion.proposer]);
            }
        }
        emit MotionExecuted(motionId, motion.description);
    }

    function updateVotingPower() public {
        cachedVotingPower = totalVotingPower();
        lastVotingPowerUpdate = block.timestamp;
    }

    function totalVotingPower() internal view returns (uint256) {
        uint256 totalTalanton = IERC20(talantonContract).totalSupply();
        uint256 totalObolos = IERC20(obolosContract).totalSupply();
        return totalTalanton / 10**18 + totalObolos / (1000 * 10**18);
    }

    function triggerEmergencyPause(bytes[] calldata signatures) external onlyArchon whenNotPaused {
        require(signatures.length > 0, "Signatures required");
        require(verifySignatures(keccak256(abi.encodePacked("EmergencyPause", block.timestamp)), signatures, 3), "Requires Archon + 2 Strategoi");
        require(!emergencyPauseActive, "Already paused");
        emergencyPauseActive = true;
        pauseEndTime = block.timestamp + 72 hours;
        _pause();
        IERC20(talantonContract).pause();
        IERC20(drachmaContract).pause();
        IERC20(obolosContract).pause();
        emit EmergencyPauseTriggered(pauseEndTime);
    }

    function endEmergencyPause() external onlyArchon {
        require(emergencyPauseActive && block.timestamp >= pauseEndTime, "Pause not ended");
        emergencyPauseActive = false;
        _unpause();
        IERC20(talantonContract).unpause();
        IERC20(drachmaContract).unpause();
        IERC20(obolosContract).unpause();
    }

    function setEmergencyCondition(string calldata reason, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt) external onlyArchon whenNotPaused {
        require(bytes(reason).length > 0, "Reason cannot be empty");
        uint256 conditionId = emergencyCounter++;
        emergencyConditions[conditionId] = EmergencyCondition(reason, talantonAmt, drachmaAmt, obolosAmt, false);
        emit EmergencyConditionSet(conditionId, reason);
    }

    function executeEmergencyCondition(uint256 conditionId, address recipient, bytes[] calldata signatures) external onlyArchon nonReentrant {
        require(signatures.length > 0, "Signatures required");
        EmergencyCondition storage condition = emergencyConditions[conditionId];
        require(!condition.executed, "Already executed");
        require(verifySignatures(keccak256(abi.encodePacked("ExecuteEmergency", conditionId, recipient)), signatures, 3), "Requires Archon + 2 Strategoi");
        require(condition.talantonAmt <= emergencyVaultTalanton && condition.drachmaAmt <= emergencyVaultDrachma && condition.obolosAmt <= emergencyVaultObolos, "Insufficient funds");
        require(recipient != address(0), "Invalid recipient");

        condition.executed = true;
        emergencyVaultTalanton -= condition.talantonAmt;
        emergencyVaultDrachma -= condition.drachmaAmt;
        emergencyVaultObolos -= condition.obolosAmt;
        IERC20(talantonContract).transfer(recipient, condition.talantonAmt);
        IERC20(drachmaContract).transfer(recipient, condition.drachmaAmt);
        IERC20(obolosContract).transfer(recipient, condition.obolosAmt);
        emit VaultWithdrawn("Emergency", recipient, condition.talantonAmt, condition.drachmaAmt, condition.obolosAmt);
    }

    function distributeRevenue(uint256 startIndex, uint256 batchSize) external nonReentrant whenNotPaused {
        require(block.timestamp >= lastPayout + 30 days, "Too early");
        require(batchSize > 0, "Batch size must be positive");
        lastPayout = block.timestamp;

        uint256 talantonBalance = IERC20(talantonContract).balanceOf(address(this));
        uint256 drachmaBalance = IERC20(drachmaContract).balanceOf(address(this));
        uint256 obolosBalance = IERC20(obolosContract).balanceOf(address(this));

        uint256 devTalanton = talantonBalance * 5 / 100;
        uint256 devDrachma = drachmaBalance * 5 / 100;
        uint256 devObolos = obolosBalance * 5 / 100;
        uint256 legalTalanton = talantonBalance * 2 / 100;
        uint256 legalDrachma = drachmaBalance * 2 / 100;
        uint256 legalObolos = obolosBalance * 2 / 100;

        sidechainDevVaultTalanton += devTalanton / 2;
        sidechainDevVaultDrachma += devDrachma / 2;
        sidechainDevVaultObolos += devObolos / 2;
        fullChainDevVaultTalanton += devTalanton / 2;
        fullChainDevVaultDrachma += devDrachma / 2;
        fullChainDevVaultObolos += devObolos / 2;
        legalDefenseVaultTalanton += legalTalanton;
        legalDefenseVaultDrachma += legalDrachma;
        legalDefenseVaultObolos += legalObolos;

        talantonBalance -= (devTalanton + legalTalanton);
        drachmaBalance -= (devDrachma + legalDrachma);
        obolosBalance -= (devObolos + legalObolos);

        for (uint i = 0; i < 4 && talantonBalance >= HERO_TALANTON; i++) {
            IERC20(talantonContract).transfer(eponymousHeroes[i], HERO_TALANTON);
            IERC20(drachmaContract).transfer(eponymousHeroes[i], HERO_DRACHMA);
            IERC20(obolosContract).transfer(eponymousHeroes[i], HERO_OBOLOS);
            talantonBalance -= HERO_TALANTON;
            drachmaBalance -= HERO_DRACHMA;
            obolosBalance -= HERO_OBOLOS;
        }

        if (archon != address(0) && talantonBalance >= ARCHON_TALANTON) {
            IERC20(talantonContract).transfer(archon, ARCHON_TALANTON);
            IERC20(drachmaContract).transfer(archon, ARCHON_DRACHMA);
            IERC20(obolosContract).transfer(archon, ARCHON_OBOLOS);
            talantonBalance -= ARCHON_TALANTON;
            drachmaBalance -= ARCHON_DRACHMA;
            obolosBalance -= ARCHON_OBOLOS;
        }

        for (uint i = startIndex; i < startIndex + batchSize && i < demos.length && talantonBalance >= DEMOS_TALANTON; i++) {
            IERC20(talantonContract).transfer(demos[i], DEMOS_TALANTON);
            IERC20(drachmaContract).transfer(demos[i], DEMOS_DRACHMA);
            IERC20(obolosContract).transfer(demos[i], DEMOS_OBOLOS);
            talantonBalance -= DEMOS_TALANTON;
            drachmaBalance -= DEMOS_DRACHMA;
            obolosBalance -= DEMOS_OBOLOS;
        }

        for (uint i = 0; i < strategoi.length && talantonBalance >= STRATEGOS_TALANTON; i++) {
            IERC20(talantonContract).transfer(strategoi[i], STRATEGOS_TALANTON);
            IERC20(drachmaContract).transfer(strategoi[i], STRATEGOS_DRACHMA);
            IERC20(obolosContract).transfer(strategoi[i], STRATEGOS_OBOLOS);
            talantonBalance -= STRATEGOS_TALANTON;
            drachmaBalance -= STRATEGOS_DRACHMA;
            obolosBalance -= STRATEGOS_OBOLOS;
        }

        for (uint i = 0; i < prytaneis.length && talantonBalance >= PRYTANIS_TALANTON; i++) {
            IERC20(talantonContract).transfer(prytaneis[i], PRYTANIS_TALANTON);
            IERC20(drachmaContract).transfer(prytaneis[i], PRYTANIS_DRACHMA);
            IERC20(obolosContract).transfer(prytaneis[i], PRYTANIS_OBOLOS);
            talantonBalance -= PRYTANIS_TALANTON;
            drachmaBalance -= PRYTANIS_DRACHMA;
            obolosBalance -= PRYTANIS_OBOLOS;
        }

        for (uint i = 0; i < grammateis.length && talantonBalance >= GRAMMATEUS_TALANTON; i++) {
            IERC20(talantonContract).transfer(grammateis[i], GRAMMATEUS_TALANTON);
            IERC20(drachmaContract).transfer(grammateis[i], GRAMMATEUS_DRACHMA);
            IERC20(obolosContract).transfer(grammateis[i], GRAMMATEUS_OBOLOS);
            talantonBalance -= GRAMMATEUS_TALANTON;
            drachmaBalance -= GRAMMATEUS_DRACHMA;
            obolosBalance -= GRAMMATEUS_OBOLOS;
        }

        emit RevenueDistributed(block.timestamp);
    }

    function withdrawLegalDefense(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) public onlyStrategoi nonReentrant whenNotPaused {
        require(signatures.length > 0 || msg.sender == address(this), "Signatures required unless internal call");
        if (signatures.length > 0) {
            require(verifySignatures(keccak256(abi.encodePacked("LegalDefenseWithdraw", recipient, talantonAmt, drachmaAmt, obolosAmt)), signatures, 7), "Invalid signatures");
        }
        require(talantonAmt <= legalDefenseVaultTalanton && drachmaAmt <= legalDefenseVaultDrachma && obolosAmt <= legalDefenseVaultObolos, "Insufficient funds");
        require(recipient != address(0), "Invalid recipient");
        legalDefenseVaultTalanton -= talantonAmt;
        legalDefenseVaultDrachma -= drachmaAmt;
        legalDefenseVaultObolos -= obolosAmt;
        IERC20(talantonContract).transfer(recipient, talantonAmt);
        IERC20(drachmaContract).transfer(recipient, drachmaAmt);
        IERC20(obolosContract).transfer(recipient, obolosAmt);
        emit VaultWithdrawn("LegalDefense", recipient, talantonAmt, drachmaAmt, obolosAmt);
    }

    function withdrawSidechainDev(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) public onlyStrategoi nonReentrant whenNotPaused {
        require(signatures.length > 0 || msg.sender == address(this), "Signatures required unless internal call");
        if (signatures.length > 0) {
            require(verifySignatures(keccak256(abi.encodePacked("SidechainDevWithdraw", recipient, talantonAmt, drachmaAmt, obolosAmt)), signatures, 7), "Invalid signatures");
        }
        require(talantonAmt <= sidechainDevVaultTalanton && drachmaAmt <= sidechainDevVaultDrachma && obolosAmt <= sidechainDevVaultObolos, "Insufficient funds");
        require(recipient != address(0), "Invalid recipient");
        sidechainDevVaultTalanton -= talantonAmt;
        sidechainDevVaultDrachma -= drachmaAmt;
        sidechainDevVaultObolos -= obolosAmt;
        IERC20(talantonContract).transfer(recipient, talantonAmt);
        IERC20(drachmaContract).transfer(recipient, drachmaAmt);
        IERC20(obolosContract).transfer(recipient, obolosAmt);
        emit VaultWithdrawn("SidechainDev", recipient, talantonAmt, drachmaAmt, obolosAmt);
    }

    function withdrawFullChainDev(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) public onlyStrategoi nonReentrant whenNotPaused {
        require(signatures.length > 0 || msg.sender == address(this), "Signatures required unless internal call");
        if (signatures.length > 0) {
            require(verifySignatures(keccak256(abi.encodePacked("FullChainDevWithdraw", recipient, talantonAmt, drachmaAmt, obolosAmt)), signatures, 7), "Invalid signatures");
        }
        require(talantonAmt <= fullChainDevVaultTalanton && drachmaAmt <= fullChainDevVaultDrachma && obolosAmt <= fullChainDevVaultObolos, "Insufficient funds");
        require(recipient != address(0), "Invalid recipient");
        fullChainDevVaultTalanton -= talantonAmt;
        fullChainDevVaultDrachma -= drachmaAmt;
        fullChainDevVaultObolos -= obolosAmt;
        IERC20(talantonContract).transfer(recipient, talantonAmt);
        IERC20(drachmaContract).transfer(recipient, drachmaAmt);
        IERC20(obolosContract).transfer(recipient, obolosAmt);
        emit VaultWithdrawn("FullChainDev", recipient, talantonAmt, drachmaAmt, obolosAmt);
    }

    function withdrawCharity(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) external onlyStrategoi nonReentrant whenNotPaused {
        require(signatures.length > 0, "Signatures required");
        require(verifySignatures(keccak256(abi.encodePacked("CharityWithdraw", recipient, talantonAmt, drachmaAmt, obolosAmt)), signatures, 7), "Invalid signatures");
        require(talantonAmt <= charityVaultTalanton && drachmaAmt <= charityVaultDrachma && obolosAmt <= charityVaultObolos, "Insufficient funds");
        require(recipient != address(0), "Invalid recipient");
        charityVaultTalanton -= talantonAmt;
        charityVaultDrachma -= drachmaAmt;
        charityVaultObolos -= obolosAmt;
        IERC20(talantonContract).transfer(recipient, talantonAmt);
        IERC20(drachmaContract).transfer(recipient, drachmaAmt);
        IERC20(obolosContract).transfer(recipient, obolosAmt);
        emit VaultWithdrawn("Charity", recipient, talantonAmt, drachmaAmt, obolosAmt);
    }

    function withdrawEmergency(address recipient, uint256 talantonAmt, uint256 drachmaAmt, uint256 obolosAmt, bytes[] calldata signatures) external onlyArchon nonReentrant {
        require(signatures.length > 0, "Signatures required");
        require(verifySignatures(keccak256(abi.encodePacked("EmergencyWithdraw", recipient, talantonAmt, drachmaAmt, obolosAmt)), signatures, 3), "Requires Archon + 2 Strategoi");
        require(talantonAmt <= emergencyVaultTalanton && drachmaAmt <= emergencyVaultDrachma && obolosAmt <= emergencyVaultObolos, "Insufficient funds");
        require(recipient != address(0), "Invalid recipient");
        emergencyVaultTalanton -= talantonAmt;
        emergencyVaultDrachma -= drachmaAmt;
        emergencyVaultObolos -= obolosAmt;
        IERC20(talantonContract).transfer(recipient, talantonAmt);
        IERC20(drachmaContract).transfer(recipient, drachmaAmt);
        IERC20(obolosContract).transfer(recipient, obolosAmt);
        emit VaultWithdrawn("Emergency", recipient, talantonAmt, drachmaAmt, obolosAmt);
    }

    function verifySignatures(bytes32 messageHash, bytes[] calldata signatures, uint256 required) internal view returns (bool) {
        require(signatures.length >= required, "Insufficient signatures");
        address[] memory usedSigners = new address[](signatures.length);
        uint256 validSignatures = 0;

        for (uint i = 0; i < signatures.length; i++) {
            address signer = ECDSAUpgradeable.recover(messageHash, signatures[i]);
            bool isDuplicate = false;
            for (uint j = 0; j < i; j++) {
                if (usedSigners[j] == signer) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate && (isStrategosMember(signer) || signer == archon)) {
                usedSigners[validSignatures] = signer;
                validSignatures++;
            }
        }
        return validSignatures >= required;
    }

    function isStrategosMember(address signer) internal view returns (bool) {
        for (uint i = 0; i < strategoi.length; i++) {
            if (strategoi[i] == signer) return true;
        }
        return false;
    }

    uint256[50] private __gap;
}
