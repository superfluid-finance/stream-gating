import { HardhatUserConfig } from "hardhat/config";
import { config } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-dependency-compiler";
import { ethers } from "ethers";

config();

const RPC_URLS = {
  mainnet: process.env.MAINNET_RPC_URL || "",
  polygon: process.env.POLYGON_RPC_URL || "",
  mumbai: process.env.POLYGON_MUMBAI_RPC_URL || "",
};

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

const MNEMONIC =
  process.env.MNEMONIC ||
  "test test test test test test test test test test test junk";
const PRIVATE_KEY =
  process.env.PRIVATE_KEY || ethers.Wallet.createRandom().privateKey;

const hardhatUserConfig: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.19",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    polygon: {
      accounts: {
        mnemonic: MNEMONIC,
        count: 1,
        initialIndex: 0,
        path: "m/44'/60'/0'/0",
        passphrase: "",
      },
      chainId: 137,
      url: RPC_URLS.polygon,
    },
    mumbai: {
      accounts: {
        mnemonic: MNEMONIC,
        count: 1,
        initialIndex: 0,
        path: "m/44'/60'/0'/0",
        passphrase: "",
      },
      chainId: 80001,
      url: RPC_URLS.mumbai,
    },
    hardhat: {
      chainId: 31337,
      forking: {
        url: RPC_URLS.mumbai,
        enabled: true,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      0: PRIVATE_KEY != undefined ? PRIVATE_KEY : 0,
    },
  },
  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  dependencyCompiler: {
    paths: [
      "@superfluid-finance/ethereum-contracts/contracts/utils/CFAv1Forwarder.sol",
    ],
  },
};

export default hardhatUserConfig;
