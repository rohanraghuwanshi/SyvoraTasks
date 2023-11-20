// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title NFTMarketplace
 * @dev A simple upgradeable NFT marketplace contract with ERC1155 and ERC721 support.
 */
contract NFTMarketplace is Initializable, OwnableUpgradeable {
    struct Sale {
        address owner;
        address tokenAddress;
        uint256 tokenId;
        uint256 quantity;
        uint256 price;
        address paymentToken;
    }

    mapping(uint256 => Sale) public sales;
    mapping(address => mapping(uint256 => uint256)) public erc721SaleMap;

    /**
     * @dev Emitted when a sale is created or updated.
     */
    event SaleUpdated(
        uint256 saleId,
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
    event NFTBought(uint256 saleId, address indexed buyer);

    /**
     * @dev Emitted when marketplace owner withdraws fees.
     */
    event FeeWithdrawn(uint256 amount);

    uint256 public constant FEE_PERCENTAGE = 55;

    /**
     * @dev Initializes the contract.
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }

    /**
     * @dev Creates or updates a sale for ERC1155 tokens.
     * @param tokenAddress Address of the ERC1155 contract.
     * @param tokenId Unique ID of the asset.
     * @param quantity Number of assets being sold.
     * @param price Price of the asset.
     * @param paymentToken Acceptable ERC20 token address as payment.
     */
    function createOrUpdateSaleERC1155(
        address tokenAddress,
        uint256 tokenId,
        uint256 quantity,
        uint256 price,
        address paymentToken
    ) external {
        require(quantity > 0, "Quantity must be greater than 0");

        ERC1155Upgradeable erc1155Contract = ERC1155Upgradeable(tokenAddress);

        require(erc1155Contract.balanceOf(msg.sender, tokenId)>=quantity, "Insufficient Tokens Owned");

        address owner = msg.sender;

        Sale storage sale = sales[tokenId];
        sale.owner = owner;
        sale.tokenAddress = tokenAddress;
        sale.tokenId = tokenId;
        sale.quantity = quantity;
        sale.price = price;
        sale.paymentToken = paymentToken;

        emit SaleUpdated(
            tokenId,
            owner,
            tokenAddress,
            tokenId,
            quantity,
            price,
            paymentToken
        );
    }

    /**
     * @dev Creates or updates a sale for ERC721 tokens.
     * @param tokenAddress Address of the ERC721 contract.
     * @param tokenId Unique ID of the asset.
     * @param price Price of the asset.
     * @param paymentToken Acceptable ERC20 token address as payment.
     */
    function createOrUpdateSaleERC721(
        address tokenAddress,
        uint256 tokenId,
        uint256 price,
        address paymentToken
    ) external {
        ERC721Upgradeable erc721Contract = ERC721Upgradeable(tokenAddress);
        address owner = erc721Contract.ownerOf(tokenId);

        Sale storage sale = sales[tokenId];
        sale.owner = owner;
        sale.tokenAddress = tokenAddress;
        sale.tokenId = tokenId;
        sale.quantity = 1; // For ERC721, quantity is always 1
        sale.price = price;
        sale.paymentToken = paymentToken;

        erc721SaleMap[tokenAddress][tokenId] = tokenId;

        emit SaleUpdated(
            tokenId,
            owner,
            tokenAddress,
            tokenId,
            1,
            price,
            paymentToken
        );
    }

    /**
     * @dev Buys an NFT.
     * @param saleId ID of the sale.
     */
    function buyNFT(uint256 saleId) external payable {
        Sale storage sale = sales[saleId];

        require(sale.quantity > 0, "Sale does not exist");
        require(
            sale.quantity <=
                ERC1155Upgradeable(sale.tokenAddress).balanceOf(
                    sale.owner,
                    sale.tokenId
                ),
            "Insufficient quantity"
        );

        if (sale.paymentToken == address(0)) {
            require(msg.value == sale.price, "Incorrect ETH value sent");
            payable(sale.owner).transfer(sale.price);
        } else {
            require(
                ERC20Upgradeable(sale.paymentToken).transferFrom(
                    msg.sender,
                    sale.owner,
                    sale.price
                ),
                "Payment failed"
            );
        }

        if (sale.quantity > 1) {
            ERC1155Upgradeable(sale.tokenAddress).safeTransferFrom(
                sale.owner,
                msg.sender,
                sale.tokenId,
                sale.quantity,
                ""
            );
        } else {
            ERC721Upgradeable(sale.tokenAddress).safeTransferFrom(
                sale.owner,
                msg.sender,
                sale.tokenId
            );
            erc721SaleMap[sale.tokenAddress][sale.tokenId] = 0;
        }

        uint256 feeAmount = (sale.price * FEE_PERCENTAGE) / 10000;
        payable(owner()).transfer(feeAmount);

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
