import { expect } from "chai";
import { ethers } from "hardhat";
import { NFT } from "../typechain-types/contracts/NFT";

describe("NFT Contract", function () {
  let nftContract: NFT;

  before(async function () {
    const signers = await ethers.getSigners();
    this.account = signers[0]
    this.Token = await ethers.getContractFactory("Token")
    this.erc20Contract = await this.Token.deploy()
    this.nftFactory = await ethers.getContractFactory("NFT");
    this.nftContract = await this.nftFactory.deploy(this.erc20Contract.target)
  });

  it("Should mint a new NFT token to the buyer", async function () {
    const erc20Amount = "100";

    await this.erc20Contract.mint(this.account.address, ethers.parseEther(erc20Amount));
    await this.erc20Contract.approve(this.nftContract.target, ethers.parseEther(erc20Amount));

    await this.nftContract.connect(this.account).mintWithERC20(ethers.parseEther(erc20Amount));

    expect(await this.nftContract.balanceOf(this.account.address)).to.equal(1);
  });

  it("Should reject the transaction if the token with the given ERC20 amount has already been minted", async function () {
    const erc20Amount = "100";
    
    await this.erc20Contract.mint(this.account.address, ethers.parseEther(erc20Amount));
    await this.erc20Contract.approve(this.account.address, ethers.parseEther(erc20Amount));
    await expect(this.nftContract.mintWithERC20(ethers.parseEther(erc20Amount))).to.be.revertedWith(
      "Token with the given ERC20 amount has already been minted"
    );
  });

  it("Should allow the owner to withdraw all ERC20 tokens from the contract", async function () {
    const ownerBalance = await this.erc20Contract.balanceOf(this.account.address)
    const nftContractBalance = await this.erc20Contract.balanceOf(this.nftContract.target)
    await this.erc20Contract.approve(this.nftContract.target, await this.erc20Contract.balanceOf(this.nftContract.target));
    await this.nftContract.withdrawToken();

    expect(await this.erc20Contract.balanceOf(this.account.address)).to.equal(ownerBalance+nftContractBalance);
  });
});
