// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract RelicNFT is Initializable, OwnableUpgradeable, ERC721Upgradeable {
    address public obolos;
    uint256 public tokenIdCounter;

    event Minted(address indexed to, uint256 tokenId);

    function initialize(address _obolos) external initializer {
        __ERC721_init("RelicNFT", "RLC");
        __Ownable_init(msg.sender); // Owned by Politeia post-deployment
        obolos = _obolos;
        tokenIdCounter = 1;
    }

    function mint(address to) external onlyOwner {
        _safeMint(to, tokenIdCounter);
        emit Minted(to, tokenIdCounter);
        tokenIdCounter++;
    }
}
