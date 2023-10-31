import { toBigInt } from "ethers";
import { ethers } from "hardhat";

require('dotenv').config();

async function main() {

    const contractOwner = await ethers.getSigners();

    console.log(`Deploying contract from: ${contractOwner[0].address}`);

  const Token = await ethers.getContractFactory('Token');
  const Shop = await ethers.getContractFactory('Shop');
  const NFT = await ethers.getContractFactory('NFT');

  console.log("\n--------------------------------------\n");
  console.log('Deploying Token...');

  const syvoraToken = await Token.deploy();
  const tokenAddress = await syvoraToken.getAddress()
  
  console.log(`Token deployed to: ${tokenAddress}`)

  console.log("\n--------------------------------------\n");
  console.log('Deploying Shop...');
  
  const shop = await Shop.deploy(tokenAddress, toBigInt(process.env.INITIAL_PRICE ?? 1));
  const shopAddress = await shop.getAddress()
  
  console.log(`Shop deployed to: ${shopAddress}`)
  console.log("\n--------------------------------------\n");


  console.log('Deploying NFT Factory...');

  const nftFactory = await NFT.deploy(tokenAddress);
  const nftFactoryAddress = await nftFactory.getAddress()
  
  console.log(`NFT Factory deployed to: ${nftFactoryAddress}`)
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });