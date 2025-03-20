// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract PerksManager is Initializable, OwnableUpgradeable {
    address public obolos;
    mapping(address => uint256) public votingBoost;

    event BoostUpdated(address indexed user, uint256 boost);

    function initialize(address _obolos) external initializer {
        __Ownable_init(msg.sender); // Owned by Politeia post-deployment
        obolos = _obolos;
    }

    function updateBoost(address user, uint256 stakedAmount) external onlyOwner {
        uint256 boost = stakedAmount / (1000 * 10**18); // 1 boost per 1000 Obolos staked
        votingBoost[user] = boost > 0 ? boost : 1;
        emit BoostUpdated(user, votingBoost[user]);
    }

    function getVotingBoost(address user) external view returns (uint256) {
        return votingBoost[user];
    }
}
