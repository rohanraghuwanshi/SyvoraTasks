import { ethers } from "hardhat";
import { expect } from "chai";
var BigNumber = require('big-number');

describe("Shop Contract", function () {

  before(async function () {
    this.Shop = await ethers.getContractFactory('Shop');
    this.Token = await ethers.getContractFactory('Token');
  });

  beforeEach(async function () {
    this.syvoraToken = await this.Token.deploy();

    this.shop = await this.Shop.deploy(this.syvoraToken, ethers.parseEther("0.01"));

    this.owner = await ethers.provider.getSigner(await this.shop.owner())

    const signers = await ethers.getSigners();
    this.buyer = await ethers.provider.getSigner(signers[1].address)
  });

  it("Should set the initial price and token contract correctly", async function () {
    await this.shop.setPrice(ethers.parseUnits("0.01"))
    
    expect(await this.shop.tokenContract()).to.equal(this.syvoraToken.target);
    expect(await this.shop.pricePerToken()).to.equal(ethers.parseEther("0.01"));
  });

  it("Should allow the owner to set the price", async function () {

    await this.shop.connect(this.owner).setPrice(ethers.parseEther("0.02"));
    expect(await this.shop.pricePerToken()).to.equal(ethers.parseEther("0.02"));
  });

  it("Should not allow non-owner to set the price", async function () {
    await expect(this.shop.connect(this.buyer).setPrice(ethers.parseEther("0.02"))).to.be.reverted
  });

  it("Should allow a user to purchase tokens", async function () {
    await this.syvoraToken.mint(this.shop.target, ethers.parseEther("100"));
    
    const initialBalance = await this.syvoraToken.balanceOf(this.buyer.getAddress());
    
    const valueToSend = ethers.parseEther("1");
    
    await this.shop.connect(this.buyer).buy({ value: valueToSend });
    const finalBalance = await this.syvoraToken.balanceOf(this.buyer.getAddress());
    
    expect(finalBalance).to.be.greaterThan(initialBalance)
  });

  it("Should not allow the purchase of tokens if the shop is out of tokens", async function () {
    const valueToSend = ethers.parseEther("1"); // Sending 1 Ether

    await expect(this.shop.connect(this.buyer).buy({ value: valueToSend })).to.be.revertedWith("The shop is out of tokens");
  });
});
