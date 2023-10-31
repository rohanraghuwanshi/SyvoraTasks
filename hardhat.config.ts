import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();

const ALCHEMY_API_URL_GOERLI = process.env.ALCHEMY_API_URL_GOERLI
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || ''

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    goerli: {
      url: ALCHEMY_API_URL_GOERLI,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  },
};

export default config;
