// import { ethers } from "hardhat";
import {ethers, upgrades} from "@nomiclabs/hardhat-ethers"
async function main() {
   const NFTMarketplace = await ethers.getContractFactory("NFTMarketPlace");
   console.log("Deploying NFTMarketPlace...");
   const nftMarketPlace = await NFTMarketplace.deploy();
   console.log("NFTMarketPlace Contract deployed to:", nftMarketPlace.getAddress());
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
 });