// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

interface ICitizenID {
    function isVerified(address user) external view returns (bool);
}

interface IOracle {
    function getPrice(address token) external view returns (uint256);
}

interface ILiquidityPoolManager {
    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external;
}

contract Drachma is ERC20Upgradeable, ReentrancyGuardUpgradeable, OwnableUpgradeable, PausableUpgradeable {
    address public citizenIDContract;
    address public talantonContract;
    address public politeia;
    address public oracle;
    address public layerZeroEndpoint;
    address public drachmaObolosLP;
    address public liquidityPoolManager;

    uint256 public constant STAKING_REWARD_RATE = 3; // 3% APR
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakeTimestamp;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    function initialize(
        address _citizenIDContract,
        address _talantonContract,
        address _politeia,
        address _oracle,
        address _layerZeroEndpoint,
        address _drachmaObolosLP,
        address _liquidityPoolManager
    ) external initializer {
        __ERC20_init("Drachma", "DRA");
        __ReentrancyGuard_init();
        __Ownable_init(_politeia);
        __Pausable_init();
        citizenIDContract = _citizenIDContract;
        talantonContract = _talantonContract;
        politeia = _politeia;
        oracle = _oracle;
        layerZeroEndpoint = _layerZeroEndpoint;
        drachmaObolosLP = _drachmaObolosLP;
        liquidityPoolManager = _liquidityPoolManager;
        _mint(_politeia, 500000000 * 10**18); // Initial supply to DAO
    }

    modifier onlyDAO() {
        require(msg.sender == politeia, "Only Politeia can call");
        _;
    }

    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(ICitizenID(citizenIDContract).isVerified(msg.sender), "Not verified");
        require(amount > 0, "Amount must be greater than 0");
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

    function calculateStakingReward(address user) public view returns (uint256) {
        uint256 timeStaked = block.timestamp - stakeTimestamp[user];
        return (stakedBalance[user] * STAKING_REWARD_RATE * timeStaked) / (365 days * 100);
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
