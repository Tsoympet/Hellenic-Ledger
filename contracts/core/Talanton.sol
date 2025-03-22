// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

interface ICitizenID {
    function isVerified(address user) external view returns (bool);
}

interface ITitanicNFT {
    function balanceOf(address owner) external view returns (uint256);
}

interface IDisputeResolver {
    function resolveDispute(address staker, uint256 amount) external;
}

contract Talanton is ERC20Upgradeable, ReentrancyGuardUpgradeable, OwnableUpgradeable, PausableUpgradeable {
    address public citizenIDContract;
    address public drachmaContract;
    address public politeia;
    address public layerZeroEndpoint;
    address public titanicNFTContract;
    address public disputeResolverContract;

    uint256 public constant TOTAL_SUPPLY_CAP = 21_000_000 * 10**18;
    uint256 public constant STAKE_AMOUNT = 32_000 * 10**18;
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% APR
    uint256 public constant MINING_DIFFICULTY = 1000;
    uint256 public constant TARGET = type(uint256).max / MINING_DIFFICULTY; // Cached target
    uint256 public decayFactor;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakeTimestamp;
    mapping(address => uint256) public lastMinedBlock;
    mapping(address => uint256) public titanicMints;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event Mined(address indexed miner, uint256 amount, uint256 nonce);

    function initialize(
        address _citizenIDContract,
        address _drachmaContract,
        address _politeia,
        address _layerZeroEndpoint,
        address _titanicNFTContract,
        address _disputeResolverContract
    ) external initializer {
        __ERC20_init("Talanton", "TAL");
        __ReentrancyGuard_init();
        __Ownable_init(_politeia);
        __Pausable_init();
        citizenIDContract = _citizenIDContract;
        drachmaContract = _drachmaContract;
        politeia = _politeia;
        layerZeroEndpoint = _layerZeroEndpoint;
        titanicNFTContract = _titanicNFTContract;
        disputeResolverContract = _disputeResolverContract;
        decayFactor = 1e18;
    }

    modifier onlyDAO() {
        require(msg.sender == politeia, "Only Politeia can call");
        _;
    }

    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(ICitizenID(citizenIDContract).isVerified(msg.sender), "Not verified");
        require(amount >= STAKE_AMOUNT, "Insufficient stake amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
        stakedBalance[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant whenNotPaused {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        uint256 reward = calculateStakingReward(msg.sender);
        stakedBalance[msg.sender] -= amount;
        _mint(msg.sender, amount + reward);
        stakeTimestamp[msg.sender] = block.timestamp;
        emit Unstaked(msg.sender, amount);
    }

    function mine(uint256 nonce) external nonReentrant whenNotPaused {
        require(ICitizenID(citizenIDContract).isVerified(msg.sender), "Not verified");
        require(stakedBalance[msg.sender] >= STAKE_AMOUNT, "Must stake at least 32,000 TAL to mine");

        bytes32 blockHash = blockhash(block.number - 1);
        require(blockHash != bytes32(0), "Block hash unavailable, try next block");
        bytes32 solution = keccak256(abi.encodePacked(msg.sender, blockHash, nonce, stakedBalance[msg.sender]));
        require(uint256(solution) <= TARGET, "Invalid solution");

        require(lastMinedBlock[msg.sender] < block.number, "Already mined this block");
        lastMinedBlock[msg.sender] = block.number;

        uint256 baseMintAmount = 1 * 10**18;
        uint256 stakingBonus = calculateStakingBonus(msg.sender);
        uint256 mintAmount = baseMintAmount + stakingBonus;
        require(totalSupply() + mintAmount <= TOTAL_SUPPLY_CAP, "Exceeds supply cap");
        _mint(msg.sender, mintAmount);

        if (ITitanicNFT(titanicNFTContract).balanceOf(msg.sender) > 0) {
            titanicMints[msg.sender]++;
        }

        emit Mined(msg.sender, mintAmount, nonce);
    }

    function calculateStakingReward(address user) public view returns (uint256) {
        uint256 timeStaked = block.timestamp - stakeTimestamp[user];
        uint256 reward = (stakedBalance[user] * STAKING_REWARD_RATE * timeStaked) / (365 days * 100);
        return reward / decayFactor;
    }

    function calculateStakingBonus(address user) public view returns (uint256) {
        uint256 timeStaked = block.timestamp - stakeTimestamp[user];
        return (stakedBalance[user] * timeStaked * 1e17) / (STAKE_AMOUNT * 365 days);
    }

    function updateRewardRate(uint256 newStakeRate, uint256 newMiningRate) external onlyDAO {
        // Placeholder for reward rate update logic
    }

    function updateDecayFactor(uint256 newFactor) external onlyDAO {
        require(newFactor > 0, "Decay factor cannot be zero");
        decayFactor = newFactor;
    }

    function pause() external onlyDAO {
        _pause();
    }

    function unpause() external onlyDAO {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
