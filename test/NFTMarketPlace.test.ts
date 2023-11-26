import { ethers } from 'hardhat';
import { expect } from 'chai';
import { NFTMarketplace, ERC721Token, ERC1155Token, Token } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

const ERC721_TOKEN_NAME = "MyToken"
const ERC721_TOKEN_SYMBOL = "MTK"

const ERC1155_BASEURI = ""

describe('NFTMarketplace', () => {
    let owner: HardhatEthersSigner;
    let user: HardhatEthersSigner;
    let nftMarketplace: NFTMarketplace;
    let erc20Token: Token;
    let erc721Token: ERC721Token;
    let erc1155Token: ERC1155Token;

    before(async () => {
        [owner, user] = await ethers.getSigners();

        const NFTMarketplaceFactory = await ethers.getContractFactory('NFTMarketplace');
        nftMarketplace = (await NFTMarketplaceFactory.deploy()) as NFTMarketplace;

        const erc20TokenFactory = await ethers.getContractFactory('Token')
        erc20Token = (await erc20TokenFactory.deploy()) as Token

        const erc721TokenFactory = await ethers.getContractFactory('ERC721Token')
        erc721Token = (await erc721TokenFactory.deploy(owner, ERC721_TOKEN_NAME, ERC721_TOKEN_SYMBOL)) as ERC721Token

        const erc1155TokenFactory = await ethers.getContractFactory('ERC1155Token')
        erc1155Token = (await erc1155TokenFactory.deploy(owner, ERC1155_BASEURI)) as ERC1155Token
    });

    describe('createOrUpdateERC721Sale', () => {
        it('should create or update a sale for ERC721 tokens', async () => {
            const tokenAddress = await erc721Token.getAddress();
            const tokenId = 0;
            const quantity = 1;
            const price = ethers.parseEther('1');
            const paymentToken = ethers.ZeroAddress;

            await nftMarketplace.createOrUpdateERC721Sale(tokenAddress, tokenId, quantity, price, paymentToken)

            const sale = await nftMarketplace.sales(ethers.solidityPacked(["address", "address", "uint256"], [owner.address, tokenAddress, tokenId]));

            expect(sale[0]).to.equal(owner.address);
            expect(sale[1]).to.equal(tokenAddress);
            expect(sale[2]).to.equal(tokenId);
            expect(sale[3]).to.equal(quantity);
            expect(sale[4]).to.equal(price);
            expect(sale[5]).to.equal(paymentToken);
        });
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
                await nftMarketplaceWithOwner.createOrUpdateERC1155Sale(tokenAddress, tokenId, quantity, price, paymentToken)
            )
                .to.emit(nftMarketplace, 'SaleUpdated')
                .withArgs(
                    owner.address,
                    tokenAddress,
                    tokenId,
                    quantity,
                    price,
                    paymentToken
                );

            // Verify that the sale information is correctly stored in the mapping
            const sale = await nftMarketplace.sales(
                ethers.solidityPacked(['address', 'address', 'uint256'], [owner.address, tokenAddress, tokenId])
            );

            expect(sale.owner).to.equal(owner.address);
            expect(sale.tokenAddress).to.equal(tokenAddress);
            expect(sale.tokenId).to.equal(tokenId);
            expect(sale.quantity).to.equal(quantity);
            expect(sale.price).to.equal(price);
            expect(sale.paymentToken).to.equal(paymentToken);
        });

    });

    describe('buyERC721', () => {
        it("should allow buying ERC721 with ETH", async () => {
            await erc721Token.safeMint(owner);
            await erc721Token.approve(await nftMarketplace.getAddress(), 0);

            await nftMarketplace.createOrUpdateERC721Sale(
                await erc721Token.getAddress(),
                0,
                1,
                ethers.parseEther('1'),
                ethers.ZeroAddress
            );
            
            const initialBuyerBalance = await ethers.provider.getBalance(user);
            await nftMarketplace.connect(user).buyERC721(ethers.solidityPacked(["address", "address", "uint256"], [owner.address, await erc721Token.getAddress(), 0]), { value: ethers.parseEther('1') });
            const finalBuyerBalance = await ethers.provider.getBalance(user);
            
            const sale = await nftMarketplace.sales(ethers.solidityPacked(["address", "address", "uint256"], [owner.address, await erc721Token.getAddress(), 0]));
            expect(finalBuyerBalance).to.lessThan(initialBuyerBalance);

            expect(sale[3]).to.equal(0);

        });

        it("should allow buying ERC721 with ERC20", async () => {
            await erc721Token.safeMint(owner);
            await erc721Token.approve(await nftMarketplace.getAddress(), 1);
            
            await erc20Token.mint(user.address, ethers.parseEther('1'))
            await erc20Token.connect(user).approve(await nftMarketplace.getAddress(), ethers.parseEther('1'));
            

            await nftMarketplace.createOrUpdateERC721Sale(
                await erc721Token.getAddress(),
                1,
                1,
                ethers.parseEther('1'),
                await erc20Token.getAddress()
            );

            const initialBuyerBalance = await erc20Token.balanceOf(user);
            await nftMarketplace.connect(user).buyERC721(ethers.solidityPacked(["address", "address", "uint256"], [owner.address, await erc721Token.getAddress(), 1]));
            const finalBuyerBalance = await erc20Token.balanceOf(user);

            expect(finalBuyerBalance).to.lessThan(initialBuyerBalance);

            const sale = await nftMarketplace.sales(ethers.solidityPacked(["address", "address", "uint256"], [owner.address, await erc721Token.getAddress(), 1]));
            expect(sale[3]).to.equal(0);
        });
    });

    describe('buyERC1155', () => {
        it('should allow buying ERC1155 with ETH', async () => {
            await erc1155Token.mint(owner.getAddress(), 1, 10, '0x');
            await erc1155Token.setApprovalForAll(await nftMarketplace.getAddress(), true)

            await nftMarketplace.createOrUpdateERC1155Sale(
                await erc1155Token.getAddress(),
                1,
                5,
                ethers.parseEther('1'),
                ethers.ZeroAddress
            );

            const saleId = ethers.solidityPacked(["address", "address", "uint256"], [owner.address, await erc1155Token.getAddress(), 1]);

            const initialBuyerBalance = await ethers.provider.getBalance(user);
            await nftMarketplace.connect(user).buyERC1155(saleId, { value: ethers.parseEther('1') })
            const finalBuyerBalance = await ethers.provider.getBalance(user);

            expect(finalBuyerBalance).to.lessThan(initialBuyerBalance);

            const updatedSale = await nftMarketplace.sales(saleId);
            expect(updatedSale.quantity).to.equal(0);
        });

        it('should allow buying ERC1155 with ERC20', async () => {
            await erc1155Token.mint(owner.getAddress(), 1, 10, '0x');
            await erc1155Token.setApprovalForAll(await nftMarketplace.getAddress(), true)

            await erc20Token.mint(user.address, ethers.parseEther('1'))
            await erc20Token.connect(user).approve(await nftMarketplace.getAddress(), ethers.parseEther('1'));

            await nftMarketplace.createOrUpdateERC1155Sale(
                await erc1155Token.getAddress(),
                1,
                5,
                ethers.parseEther('1'),
                await erc20Token.getAddress()
            );

            const saleId = ethers.solidityPacked(["address", "address", "uint256"], [owner.address, await erc1155Token.getAddress(), 1]);

            const initialBuyerBalance = await erc20Token.balanceOf(user.address);
            await nftMarketplace.connect(user).buyERC1155(saleId, { value: ethers.parseEther('1') })
            const finalBuyerBalance = await erc20Token.balanceOf(user.address);

            // Check that the buyer's ERC20 balance has decreased
            expect(finalBuyerBalance).to.lt(initialBuyerBalance);

            // Check that the sale has been removed
            const updatedSale = await nftMarketplace.sales(saleId);
            expect(updatedSale.quantity).to.equal(0);

            // Add more assertions as needed
        });
    });
})
