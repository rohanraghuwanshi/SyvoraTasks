// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Token.sol";

/**
 * @title Shop
 * @dev This contract represents a simple shop that allows users to buy tokens using Ether.
 * Users can set the token price, purchase tokens, and withdraw funds.
 */
contract Shop is Ownable2Step {
    address public tokenContract; // The address of the ERC20 token contract used in the shop.
    uint256 public pricePerToken; // The price per token in Ether.

    /**
     * @dev Constructor to initialize the shop with a token contract and an initial token price.
     * @param _tokenContract The address of the ERC20 token contract.
     * @param _initialPrice The initial price per token in Ether.
     */
    constructor(
        address _tokenContract,
        uint256 _initialPrice
    ) Ownable(msg.sender) {
        tokenContract = _tokenContract;
        pricePerToken = _initialPrice;
    }

    /**
     * @dev Allows the owner to set a new price per token.
     * @param _newPrice The new price per token in Ether.
     */
    function setPrice(uint256 _newPrice) public onlyOwner {
        pricePerToken = _newPrice;
    }

    /**
     * @dev Allows users to purchase tokens by sending Ether and receiving tokens in return.
     * @return maxTokens The maximum number of tokens that can be purchased with the sent Ether.
     * @return remainder The remaining Ether sent back to the user.
     */
    function buy()
        public
        payable
        returns (uint256 maxTokens, uint256 remainder)
    {
        IERC20 token = IERC20(tokenContract);
        uint256 tokenBalance = token.balanceOf(address(this));

        require(tokenBalance > 0, "The shop is out of tokens");

        unchecked {
            maxTokens = (msg.value * 1e18) / pricePerToken;

            if (maxTokens > tokenBalance) {
                maxTokens = tokenBalance;
            }
        }
        uint256 totalPrice = (maxTokens * pricePerToken) / 1e18;
        remainder = msg.value - totalPrice;

        require(
            address(this).balance >= remainder,
            "Shop does not have enough Ether for the remainder"
        );

        SafeERC20.safeTransfer(IERC20(tokenContract), msg.sender, maxTokens);
        payable(owner()).transfer(totalPrice);
        if (remainder > 0) {
            payable(msg.sender).transfer(remainder);
        }

        return (maxTokens, remainder);
    }

    /**
     * @dev Allows the owner to withdraw the Ether balance of the shop.
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Allows the owner to withdraw any remaining tokens from the shop.
     */
    function withdrawToken() public onlyOwner {
        IERC20 token = IERC20(tokenContract);
        uint256 tokenBalance = token.balanceOf(address(this));
        SafeERC20.safeTransfer(IERC20(tokenContract), owner(), tokenBalance);
    }
}
