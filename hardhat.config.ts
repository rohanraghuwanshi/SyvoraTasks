import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API_KEY = "Qh72n1XLdTvH8ExtsozHk6W1OwxuEJiL"
const GOERLI_PRIVATE_KEY = ""

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    goelri: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  },
};

export default config;
