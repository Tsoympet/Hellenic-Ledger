// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract SmartContractFactory is Initializable, OwnableUpgradeable {
    address public obolos;
    uint256 public constant DEPLOYMENT_FEE = 100 * 10**18; // 100 Obolos

    event ContractDeployed(address indexed creator, address deployedContract);

    function initialize(address _obolos) external initializer {
        __Ownable_init(msg.sender); // Owned by Politeia post-deployment
        obolos = _obolos;
    }

    function deployContract(address creator) external onlyOwner returns (address) {
        IERC20Upgradeable(obolos).transferFrom(creator, address(this), DEPLOYMENT_FEE);
        // Placeholder: Deploy a simple contract (e.g., a counter)
        address newContract = address(new SimpleContract());
        emit ContractDeployed(creator, newContract);
        return newContract;
    }
}

contract SimpleContract {
    uint256 public counter;

    function increment() external {
        counter++;
    }
}
