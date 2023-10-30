import { ethers } from "hardhat";


async function main() {

  const contractOwner = await ethers.getSigners();

  console.log(`Deploying contract from: ${contractOwner[0].address}`);

  const Token = await ethers.getContractFactory('Token');

  console.log('Deploying Token...');
  const syvoraToken = await Token.deploy();
  
  console.log(`Token deployed to: ${ await syvoraToken.getAddress()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });