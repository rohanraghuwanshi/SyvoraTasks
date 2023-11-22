import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTMarketplace } from "../typechain-types";

const FEE_PERCENTAGE = 55

describe("NFTMarketplace", () => {
  let owner:any;
  let user1:any;
  let user2:any;
  let marketplace: NFTMarketplace;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace", owner);
    marketplace = await NFTMarketplaceFactory.deploy()  as NFTMarketplace;
  });

  it("should create and update sale for ERC1155", async () => {
    const tokenId = 1;
    const quantity = 5;
    const price = ethers.parseEther("1");
    const paymentToken = ethers.ZeroAddress;

    await expect(marketplace.createOrUpdateSaleERC1155(
      owner.address,
      tokenId,
      quantity,
      price,
      paymentToken
    ))
      .to.emit(marketplace, "SaleUpdated")
      .withArgs(tokenId, owner.address, owner.address, tokenId, quantity, price, paymentToken);

    // Update the sale
    const newPrice = ethers.parseEther("2");
    await expect(marketplace.createOrUpdateSaleERC1155(
      owner.address,
      tokenId,
      quantity,
      newPrice,
      paymentToken
    ))
      .to.emit(marketplace, "SaleUpdated")
      .withArgs(tokenId, owner.address, owner.address, tokenId, quantity, newPrice, paymentToken);
  });

  it("should create and update sale for ERC721", async () => {
    const tokenId = 1;
    const price = ethers.parseEther("1");
    const paymentToken = ethers.ZeroAddress;

    await expect(marketplace.createOrUpdateSaleERC721(
      owner.address,
      tokenId,
      price,
      paymentToken
    ))
      .to.emit(marketplace, "SaleUpdated")
      .withArgs(tokenId, owner.address, owner.address, tokenId, 1, price, paymentToken);

    // Update the sale
    const newPrice = ethers.parseEther("2");
    await expect(marketplace.createOrUpdateSaleERC721(
      owner.address,
      tokenId,
      newPrice,
      paymentToken
    ))
      .to.emit(marketplace, "SaleUpdated")
      .withArgs(tokenId, owner.address, owner.address, tokenId, 1, newPrice, paymentToken);
  });

  it("should allow buying an NFT", async () => {
    const tokenId = 1;
    const quantity = 1;
    const price = ethers.parseEther("1");
    const paymentToken = ethers.ZeroAddress;

    await marketplace.createOrUpdateSaleERC1155(
      owner.address,
      tokenId,
      quantity,
      price,
      paymentToken
    );

    await expect(() => user1.sendTransaction({
      to: marketplace.getAddress(),
      value: price,
    }))
      .to.changeEtherBalance(owner, price.mul(FEE_PERCENTAGE).div(10000));

    await expect(() => marketplace.connect(user1).buyNFT(tokenId))
      .to.changeEtherBalance(user1, -price)
      .to.changeEtherBalance(owner, -price.mul(FEE_PERCENTAGE).div(10000));
  });

  it("should allow marketplace owner to withdraw fees", async () => {
    const tokenId = 1;
    const quantity = 1;
    const price = ethers.parseEther("1");
    const paymentToken = ethers.ZeroAddress;

    await marketplace.createOrUpdateSaleERC1155(
      owner.address,
      tokenId,
      quantity,
      price,
      paymentToken
    );

    await user1.sendTransaction({
      to: marketplace.getAddress(),
      value: price,
    });

    const initialBalance = await ethers.provider.getBalance(owner.address);

    await marketplace.connect(owner).withdrawFees();

    const finalBalance = await ethers.provider.getBalance(owner.address);
    const feeAmount = price.mul(FEE_PERCENTAGE).div(10000);

    expect(finalBalance).to.equal(initialBalance.add(feeAmount));
  });
});
