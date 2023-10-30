// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "./Token.sol";

contract Shop is Ownable {
    address public tokenContract;
    uint256 public pricePerToken;

    constructor(address _tokenContract, uint256 _initialPrice) Ownable(msg.sender){
        tokenContract = _tokenContract;
        pricePerToken = _initialPrice;
    }

    function setPrice(uint256 _newPrice) public onlyOwner {
        pricePerToken = _newPrice;
    }

    function buy() public payable returns (uint256, uint256) {
        IERC20 token = IERC20(tokenContract);
        uint256 tokenBalance = token.balanceOf(address(this));

        require(tokenBalance > 0, "The shop is out of tokens");

        uint256 maxTokens = (msg.value * 1e18) / pricePerToken;

        if (maxTokens > tokenBalance) {
            maxTokens = tokenBalance;
        }

        uint256 totalPrice = (maxTokens * pricePerToken) / 1e18;
        uint256 remainder = msg.value - totalPrice;

        require(
            address(this).balance >= remainder,
            "Shop does not have enough Ether for the remainder"
        );

        require(token.transfer(msg.sender, maxTokens), "Token transfer failed");
        payable(owner()).transfer(totalPrice);
        if (remainder > 0) {
            payable(msg.sender).transfer(remainder);
        }

        return (maxTokens, remainder);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawToken() public onlyOwner {
        IERC20 token = IERC20(tokenContract);
        uint256 tokenBalance = token.balanceOf(address(this));
        require(token.transfer(owner(), tokenBalance), "Token transfer failed");
    }
}
