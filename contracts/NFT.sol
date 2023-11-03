// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFT
 * @dev This contract allows users to mint ERC721 tokens using ERC20 tokens as collateral.
 */
contract NFT is ERC721, Ownable, ReentrancyGuard {
    address public erc20Address;

    // Maps ERC20 amounts to corresponding token IDs.
    mapping(uint256 => uint256) public tokenIdsByERC20Amount;

    /**
     * @dev Constructor to initialize the contract with the ERC20 token address.
     * @param _erc20Address The address of the ERC20 token used as collateral for minting.
     */
    constructor(address _erc20Address) ERC721("ERC20NFT", "ERC20NFT") Ownable(msg.sender) {
        erc20Address = _erc20Address;
    }

    /**
     * @dev Allows a user to mint an ERC721 token by providing a specific amount of ERC20 tokens as collateral.
     * @param _erc20Amount The amount of ERC20 tokens to use as collateral for minting.
     */
    function mintWithERC20(uint256 _erc20Amount) public nonReentrant {
        if (tokenIdsByERC20Amount[_erc20Amount] != 0) {
            revert("Token with the given ERC20 amount has already been minted");
        }

        SafeERC20.safeTransferFrom(IERC20(erc20Address), msg.sender, address(this), _erc20Amount);

        uint256 tokenId = _erc20Amount;
        _mint(msg.sender, tokenId);

        tokenIdsByERC20Amount[_erc20Amount] = tokenId;
    }

    /**
     * @dev Allows the owner of the contract to withdraw any remaining ERC20 tokens from the contract.
     */
    function withdrawToken() public onlyOwner nonReentrant {
        IERC20 token = IERC20(erc20Address);
        uint256 tokenBalance = token.balanceOf(address(this));
        SafeERC20.safeTransfer(IERC20(erc20Address), owner(), tokenBalance);
    }
}
