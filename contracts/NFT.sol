// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721,Ownable {
    address public erc20Address;

    mapping(uint256 => uint256) public tokenIdsByERC20Amount;

    constructor(address _erc20Address) ERC721("ERC20NFT", "ERC20NFT") Ownable(msg.sender){
        erc20Address = _erc20Address;
    }

    function mintWithERC20(uint256 _erc20Amount) public {
        if (tokenIdsByERC20Amount[_erc20Amount] != 0) {
            revert("Token with the given ERC20 amount has already been minted");
        }

        IERC20 erc20Token = IERC20(erc20Address);
        erc20Token.transferFrom(msg.sender, address(this), _erc20Amount);

        uint256 tokenId = _erc20Amount;
        _mint(msg.sender, tokenId);

        tokenIdsByERC20Amount[_erc20Amount] = tokenId;
    }

    function withdrawToken() public onlyOwner{
        IERC20 token = IERC20(erc20Address);
        uint256 tokenBalance = token.balanceOf(address(this));
        require(token.transfer(owner(), tokenBalance), "Token transfer failed");
    }
}
