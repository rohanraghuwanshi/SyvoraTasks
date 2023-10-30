import { ethers } from "hardhat";

const TOKEN_CONTRACT = ""
const INITIAL_PRICE = ""

async function main() {

  const contractOwner = await ethers.getSigners();

  console.log(`Deploying contract from: ${contractOwner[0].address}`);

  const Shop = await ethers.getContractFactory('Shop');

  console.log('Deploying Shop...');
  const syvoraToken = await Shop.deploy(TOKEN_CONTRACT, INITIAL_PRICE);
  
  console.log(`Shop deployed to: ${ await syvoraToken.getAddress()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });