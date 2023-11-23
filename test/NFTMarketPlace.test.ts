import { ethers } from 'hardhat';
import { expect } from 'chai';
import { NFTMarketplace, ERC721Token, ERC1155Token } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

const ERC721_TOKEN_NAME = "MyToken"
const ERC721_TOKEN_SYMBOL = "MTK"

const ERC1155_BASEURI = ""

describe('NFTMarketplace', () => {
    let owner: HardhatEthersSigner;
    let user: HardhatEthersSigner;
    let nftMarketplace: NFTMarketplace;
    let erc721Token: ERC721Token;
    let erc1155Token: ERC1155Token;

    before(async () => {
        [owner] = await ethers.getSigners();

        const NFTMarketplaceFactory = await ethers.getContractFactory('NFTMarketplace');
        nftMarketplace = (await NFTMarketplaceFactory.deploy()) as NFTMarketplace;

        const erc721TokenFactory = await ethers.getContractFactory('ERC721Token')
        erc721Token = (await erc721TokenFactory.deploy(owner, ERC721_TOKEN_NAME, ERC721_TOKEN_SYMBOL)) as ERC721Token

        const erc1155TokenFactory = await ethers.getContractFactory('ERC1155Token')
        erc1155Token = (await erc1155TokenFactory.deploy(owner, ERC1155_BASEURI)) as ERC1155Token
    });

    describe('createOrUpdateERC721Sale', () => {
        it('should create or update a sale for ERC721 tokens', async () => {
            const tokenAddress = await erc721Token.getAddress(); // Replace with a valid ERC721 token address
            const tokenId = 1;
            const quantity = 1;
            const price = ethers.parseEther('1'); // 1 ETH
            const paymentToken = ethers.ZeroAddress; // Replace with a valid ERC20 token address

            // Connect the owner signer to the contract
            const nftMarketplaceWithOwner = nftMarketplace.connect(owner);


            nftMarketplaceWithOwner.createOrUpdateERC721Sale(tokenAddress, tokenId, quantity, price, paymentToken)

            // Verify that the sale information is correctly stored in the mapping
            const sale = await nftMarketplace.getSaleDetails(owner.address, tokenAddress, tokenId);
            console.log(sale,">>>>>>>>");
            

            

            // console.log([owner.address, tokenAddress, tokenId], '\n', ethers.solidityPacked(['address', 'address', 'uint256'], [owner.address, tokenAddress, tokenId]), '\n', sale);


            expect(sale[0]).to.equal(owner.address);
            expect(sale[1]).to.equal(tokenAddress);
            expect(sale[2]).to.equal(tokenId);
            expect(sale[3]).to.equal(quantity);
            expect(sale[4]).to.equal(price);
            expect(sale[5]).to.equal(paymentToken);
        });

        // Add more test cases as needed
    });

    describe('createOrUpdateERC1155Sale', () => {
        it('should create or update a sale for ERC1155 tokens', async () => {
            const tokenAddress = await erc1155Token.getAddress(); // Replace with a valid ERC1155 token address
            const tokenId = 1;
            const quantity = 5;
            const price = ethers.parseEther('0.5'); // 0.5 ETH
            const paymentToken = ethers.ZeroAddress; // Replace with a valid ERC20 token address

            // Connect the owner signer to the contract
            const nftMarketplaceWithOwner = nftMarketplace.connect(owner);

            // Call the createOrUpdateERC1155Sale function
            await expect(
                nftMarketplaceWithOwner.createOrUpdateERC1155Sale(tokenAddress, tokenId, quantity, price, paymentToken)
            )
                .to.emit(nftMarketplace, 'SaleUpdated')
                .withArgs(
                    tokenId,
                    owner.address,
                    tokenAddress,
                    tokenId,
                    quantity,
                    price,
                    paymentToken
                );

            // Verify that the sale information is correctly stored in the mapping
            const sale = await nftMarketplace.sales(
                ethers.solidityPackedKeccak256(['address', 'address', 'uint256'], [owner.address, tokenAddress, tokenId])
            );

            expect(sale.owner).to.equal(owner.address);
            expect(sale.tokenAddress).to.equal(tokenAddress);
            expect(sale.tokenId).to.equal(tokenId);
            expect(sale.quantity).to.equal(quantity);
            expect(sale.price).to.equal(price);
            expect(sale.paymentToken).to.equal(paymentToken);
        });

        // Add more test cases as needed
    });
});
