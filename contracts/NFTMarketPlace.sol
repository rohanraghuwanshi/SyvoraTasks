// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "hardhat/console.sol";

/**
 * @title NFTMarketplace
 * @dev A simple upgradeable NFT marketplace contract with ERC1155 and ERC721 support.
 */
contract NFTMarketplace is Ownable2Step, ReentrancyGuard  {
    /**
     * @dev Struct to represent a sale.
     */
    struct Sale {
        address owner; // Address of the sale owner.
        address tokenAddress; // Address of the token being sold.
        uint256 tokenId; // ID of the token being sold.
        uint256 quantity; // Quantity of tokens for sale.
        uint256 price; // Price per token.
        address paymentToken; // Address of the token used for payment.
    }

    /**
     * @dev Mapping to store sales information with a string key.
     * The key is constructed by concatenating the owner's address, token address,
     * and token ID, separated by underscores.
     */
    mapping(string => Sale) public sales;

    /**
     * @dev Emitted when a sale is created or updated.
     */
    event SaleUpdated(
        address indexed owner,
        address indexed tokenAddress,
        uint256 indexed tokenId,
        uint256 quantity,
        uint256 price,
        address paymentToken
    );

    /**
     * @dev Emitted when an NFT is bought.
     */
    event NFTBought(string saleId, address indexed buyer);

    /**
     * @dev Emitted when marketplace owner withdraws fees.
     */
    event FeeWithdrawn(uint256 amount);

     /**
     * @dev Initializes the contract.
     */
    constructor() Ownable(msg.sender) {}

        /**
     * @dev Creates or updates a sale for ERC1155 tokens.
     * @param tokenAddress Address of the ERC1155 contract.
     * @param tokenId Unique ID of the asset.
     * @param quantity Number of assets being sold.
     * @param price Price of the asset.
     * @param paymentToken Acceptable ERC20 token address as payment.
     */
    function createOrUpdateERC721Sale(
        address tokenAddress,
        uint256 tokenId,
        uint256 quantity,
        uint256 price,
        address paymentToken
    ) external {
        require(quantity > 0, "Quantity must be greater than 0");

        Sale storage sale = sales[string(abi.encodePacked(msg.sender, tokenAddress, tokenId))];
        sale.owner = msg.sender;
        sale.tokenAddress = tokenAddress;
        sale.tokenId = tokenId;
        sale.quantity = quantity;
        sale.price = price;
        sale.paymentToken = paymentToken;

        IERC721(tokenAddress).setApprovalForAll(address(this), true);

        emit SaleUpdated(
            msg.sender,
            tokenAddress,
            tokenId,
            quantity,
            price,
            paymentToken
        );
    }

    function createOrUpdateERC1155Sale(
        address tokenAddress,
        uint256 tokenId,
        uint256 quantity,
        uint256 price,
        address paymentToken
    ) external {
        require(quantity > 0, "Quantity must be greater than 0");

        console.logBytes(abi.encodePacked(msg.sender, tokenAddress, tokenId));

        Sale storage sale = sales[string(abi.encodePacked(msg.sender, tokenAddress, tokenId))];
        sale.owner = msg.sender;
        sale.tokenAddress = tokenAddress;
        sale.tokenId = tokenId;
        sale.quantity = quantity;
        sale.price = price;
        sale.paymentToken = paymentToken;

        IERC1155(tokenAddress).setApprovalForAll(address(this), true);

        emit SaleUpdated(
            msg.sender,
            tokenAddress,
            tokenId,
            quantity,
            price,
            paymentToken
        );
    }

    function getSaleDetails(address _owner, address tokenAddress, uint256 tokenId) external view returns (Sale memory) {

        string memory key = string(abi.encodePacked(_owner, tokenAddress, tokenId));
        return sales[key];
    }

    /**
     * @dev Buys an ERC721.
     * @param saleId ID of the sale.
     */
    function buyERC721(string memory saleId) external payable {
        Sale storage sale = sales[saleId];

        require(sale.quantity > 0, "Sale does not exist");

        if (sale.paymentToken == address(0)) {
            require(msg.value == sale.price, "Incorrect ETH value sent");
            payable(sale.owner).transfer(sale.price);
        } else {
            require(
                IERC20(sale.paymentToken).transferFrom(
                    msg.sender,
                    sale.owner,
                    sale.price
                ),
                "Payment failed"
            );
        }

        IERC721(sale.tokenAddress).transferFrom(sale.owner, msg.sender,sale.tokenId);
        delete sales[saleId];
        emit NFTBought(saleId, msg.sender);
    }

    function buyERC1155(string memory saleId) external payable {
        Sale storage sale = sales[saleId];

        require(sale.quantity > 0, "Sale does not exist");

        if (sale.paymentToken == address(0)) {
            require(msg.value == sale.price, "Incorrect ETH value sent");
            payable(sale.owner).transfer(sale.price);
        } else {
            require(
                IERC20(sale.paymentToken).transferFrom(
                    msg.sender,
                    sale.owner,
                    sale.price
                ),
                "Payment failed"
            );
        }

        IERC1155(sale.tokenAddress).safeTransferFrom(sale.owner, msg.sender,sale.tokenId, sale.quantity,"");
        delete sales[saleId];
        emit NFTBought(saleId, msg.sender);
    }

    /**
     * @dev Allows the marketplace owner to withdraw fees.
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        emit FeeWithdrawn(balance);
    }

    /**
     * @dev Fallback function to receive ETH.
     */
    receive() external payable {}
}
