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
    uint256 public constant STAKE_AMOUNT = 32_000 * 10**18; // Full staking/mining threshold
    uint256 public constant MIN_STAKE_FOR_MINING = 1000 * 10**18; // Lower tier for mining
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% APR
    uint256 public constant INITIAL_MINING_DIFFICULTY = 1000; // Starting difficulty
    uint256 public constant DIFFICULTY_ADJUSTMENT_PERIOD = 20160; // ~1 week (3s blocks)
    uint256 public constant HALVING_INTERVAL = 420000; // ~2 months (3s blocks)
    uint256 public constant INITIAL_REWARD_FULL = 1 * 10**18; // 1 TAL initial reward for full stake
    uint256 public constant INITIAL_REWARD_MIN = 0.1 * 10**18; // 0.1 TAL initial reward for min stake

    uint256 public decayFactor;
    uint256 public currentDifficulty; // Dynamic difficulty
    uint256 public currentTarget; // Dynamic target
    uint256 public currentRewardFull; // Dynamic full reward
    uint256 public currentRewardMin; // Dynamic min reward
    uint256 public lastAdjustmentBlock; // Last difficulty/reward adjustment

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakeTimestamp;
    mapping(address => uint256) public lastMinedBlock;
    mapping(address => uint256) public titanicMints;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event Mined(address indexed miner, uint256 amount, uint256 nonce);
    event DifficultyAdjusted(uint256 newDifficulty, uint256 newTarget);
    event RewardHalved(uint256 newRewardFull, uint256 newRewardMin);

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
        currentDifficulty = INITIAL_MINING_DIFFICULTY;
        currentTarget = type(uint256).max / INITIAL_MINING_DIFFICULTY;
        currentRewardFull = INITIAL_REWARD_FULL;
        currentRewardMin = INITIAL_REWARD_MIN;
        lastAdjustmentBlock = block.number;
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
        require(stakedBalance[msg.sender] >= MIN_STAKE_FOR_MINING, "Must stake at least 1,000 TAL to mine");

        // Adjust difficulty and reward if needed
        adjustDifficultyAndReward();

        bytes32 blockHash = blockhash(block.number - 1);
        require(blockHash != bytes32(0), "Block hash unavailable, try next block");
        bytes32 solution = keccak256(abi.encodePacked(msg.sender, blockHash, nonce, stakedBalance[msg.sender]));
        require(uint256(solution) <= currentTarget, "Invalid solution");

        require(lastMinedBlock[msg.sender] < block.number, "Already mined this block");
        lastMinedBlock[msg.sender] = block.number;

        uint256 baseMintAmount = stakedBalance[msg.sender] >= STAKE_AMOUNT ? currentRewardFull : currentRewardMin; // Tiered reward
        uint256 stakingBonus = calculateStakingBonus(msg.sender);
        uint256 mintAmount = baseMintAmount + stakingBonus;
        require(totalSupply() + mintAmount <= TOTAL_SUPPLY_CAP, "Exceeds supply cap");
        _mint(msg.sender, mintAmount);

        if (ITitanicNFT(titanicNFTContract).balanceOf(msg.sender) > 0) {
            titanicMints[msg.sender]++;
        }

        emit Mined(msg.sender, mintAmount, nonce);
    }

    function adjustDifficultyAndReward() internal {
        uint256 blocksSinceLastAdjustment = block.number - lastAdjustmentBlock;
        if (blocksSinceLastAdjustment >= DIFFICULTY_ADJUSTMENT_PERIOD) {
            // Increase difficulty by 10% each period (simplified adjustment)
            currentDifficulty = currentDifficulty * 110 / 100;
            currentTarget = type(uint256).max / currentDifficulty;
            lastAdjustmentBlock = block.number;
            emit DifficultyAdjusted(currentDifficulty, currentTarget);

            // Halve rewards every HALVING_INTERVAL blocks
            uint256 halvings = block.number / HALVING_INTERVAL;
            if (halvings > 0 && currentRewardFull == INITIAL_REWARD_FULL / (2 ** (halvings - 1))) {
                currentRewardFull = currentRewardFull / 2;
                currentRewardMin = currentRewardMin / 2;
                emit RewardHalved(currentRewardFull, currentRewardMin);
            }
        }
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
