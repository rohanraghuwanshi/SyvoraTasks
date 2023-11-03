// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title Token
 * @dev This contract represents an ERC20 token called "Syvora" with the symbol "SVRA."
 * It allows the owner to mint new tokens.
 */
contract Token is ERC20, Ownable2Step {
    /**
     * @dev Constructor to initialize the ERC20 token with the name and symbol.
     */
    constructor() ERC20("Syvora", "SVRA") Ownable(msg.sender) {}

    /**
     * @dev Allows the owner to mint new tokens and assign them to a specific address.
     * @param to The address to which the newly minted tokens will be assigned.
     * @param amount The amount of tokens to mint and assign.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
