## Syvora Tasks

This repository contains tasks from the first assignment.

### Part 1

* Create and deploy an ERC20 Token using the OpenZeppelin library.
* Create a Shop Contract for buying the deployed ERC20 token.
* Initialize the price of a token in ETH.
* Create a setter for the price that can only be called by the owner.
* Create a `buy()` method that receives ETH and calculates and returns the maximum possible token at that price, along with the remainder amount.

### Part 2

* Create and deploy an NFT Contract that accepts any amount of your ERC20 token.
* The NFT Contract mints a token to the buyer, where the token ID is equal to the amount of ERC20 received.
* The contract rejects the transaction if a token of the given amount has already been minted.

### Part 3

* Write tests for the Contracts.
* Write deployment scripts.
* Deploy and verify the contract on the Goerli testnet.

**Steps to Work with the Project:**

1. Install the dependencies using `npm i --legacy-peer-deps`.
2. Configure the environment variables based on the `.env.example` file.
3. Compile contracts using `npx hardhat compile`.
4. Test contracts using `npx hardhat test`.
5. Deploy contracts using `npx hardhat run scripts/deploy.ts --network goerli`.
