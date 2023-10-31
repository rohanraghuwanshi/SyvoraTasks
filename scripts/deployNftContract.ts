import { ethers } from "hardhat";

const TOKEN_CONTRACT = ""

async function main() {

  const contractOwner = await ethers.getSigners();

  console.log(`Deploying contract from: ${contractOwner[0].address}`);

  const Shop = await ethers.getContractFactory('NFT');

  console.log('Deploying NFT Factory...');
  const syvoraToken = await Shop.deploy(TOKEN_CONTRACT);
  
  console.log(`NFT Factory deployed to: ${ await syvoraToken.getAddress()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });