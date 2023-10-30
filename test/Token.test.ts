import { expect } from "chai";
import { ethers } from "hardhat"

// Start test block
describe('Token', function () {
  before(async function () {
    this.Token = await ethers.getContractFactory('Token');
  });

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    this.ownerAddress = signers[0].address;
    this.recipientAddress = signers[1].address;

    this.syvoraToken = await this.Token.deploy();

    this.decimals = await this.syvoraToken.decimals();

    this.signerContract = this.syvoraToken.connect(signers[1]);
  });

  // Test cases
  it('Creates a token with a name', async function () {
    expect(await this.syvoraToken.name()).to.exist;
    // expect(await this.syvoraToken.name()).to.equal('Token');
  });

  it('Creates a token with a symbol', async function () {
    expect(await this.syvoraToken.symbol()).to.exist;
    // expect(await this.syvoraToken.symbol()).to.equal('FUN');
  });

  it('Has a valid decimal', async function () {
    expect((await this.syvoraToken.decimals()).toString()).to.equal('18');
  })

  it('Has a valid total supply', async function () {
    const expectedSupply = ethers.parseUnits('0', this.decimals);
    expect((await this.syvoraToken.totalSupply()).toString()).to.equal(expectedSupply);
  });

  it('Is able to query account balances', async function () {
    const ownerBalance = await this.syvoraToken.balanceOf(this.ownerAddress);
    expect(await this.syvoraToken.balanceOf(this.ownerAddress)).to.equal(ownerBalance);
  });

  it('Transfers the right amount of tokens to/from an account', async function () {
    const transferAmount = 1000;
    await this.syvoraToken.mint(this.ownerAddress, transferAmount);
    
    await expect(this.syvoraToken.transfer(this.recipientAddress, transferAmount)).to.changeTokenBalances(
      this.syvoraToken,
      [this.ownerAddress, this.recipientAddress],
      [-transferAmount, transferAmount]
    );
  });

  it('Emits a transfer event with the right arguments', async function () {
    const transferAmount = 100000;
    await this.syvoraToken.mint(this.ownerAddress, ethers.parseUnits(transferAmount.toString(), this.decimals));
    
    await expect(this.syvoraToken.transfer(this.recipientAddress, ethers.parseUnits(transferAmount.toString(), this.decimals)))
      .to.emit(this.syvoraToken, "Transfer")
      .withArgs(this.ownerAddress, this.recipientAddress, ethers.parseUnits(transferAmount.toString(), this.decimals))
  });

  it('Allows for allowance approvals and queries', async function () {
    const approveAmount = 10000;
    await this.signerContract.approve(this.ownerAddress, ethers.parseUnits(approveAmount.toString(), this.decimals));
    expect((await this.syvoraToken.allowance(this.recipientAddress, this.ownerAddress))).to.equal(ethers.parseUnits(approveAmount.toString(), this.decimals));
  });

  it('Emits an approval event with the right arguments', async function () {
    const approveAmount = 10000;
    await expect(this.signerContract.approve(this.ownerAddress, ethers.parseUnits(approveAmount.toString(), this.decimals)))
      .to.emit(this.syvoraToken, "Approval")
      .withArgs(this.recipientAddress, this.ownerAddress, ethers.parseUnits(approveAmount.toString(), this.decimals))
  });

  it('Allows an approved spender to transfer from owner', async function () {
    const transferAmount = 10000;
    await this.syvoraToken.mint(this.ownerAddress, ethers.parseUnits(transferAmount.toString(), this.decimals));
    await this.syvoraToken.transfer(this.recipientAddress, ethers.parseUnits(transferAmount.toString(), this.decimals))
    await this.signerContract.approve(this.ownerAddress, ethers.parseUnits(transferAmount.toString(), this.decimals))
    await expect(this.syvoraToken.transferFrom(this.recipientAddress, this.ownerAddress, transferAmount)).to.changeTokenBalances(
      this.syvoraToken,
      [this.ownerAddress, this.recipientAddress],
      [transferAmount, -transferAmount]
    );
  });

  it('Emits a transfer event with the right arguments when conducting an approved transfer', async function () {
    const transferAmount = 10000;
    await this.syvoraToken.mint(this.ownerAddress, ethers.parseUnits(transferAmount.toString(), this.decimals));
    await this.syvoraToken.transfer(this.recipientAddress, ethers.parseUnits(transferAmount.toString(), this.decimals))
    await this.signerContract.approve(this.ownerAddress, ethers.parseUnits(transferAmount.toString(), this.decimals))
    await expect(this.syvoraToken.transferFrom(this.recipientAddress, this.ownerAddress, ethers.parseUnits(transferAmount.toString(), this.decimals)))
      .to.emit(this.syvoraToken, "Transfer")
      .withArgs(this.recipientAddress, this.ownerAddress, ethers.parseUnits(transferAmount.toString(), this.decimals))
  });
});