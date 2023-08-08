import { HardhatUserConfig } from "hardhat/config";
import { config } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-dependency-compiler";

config();

const RPC_URLS = {
  mainnet: process.env.MAINNET_RPC_URL || "",
  polygon: process.env.POLYGON_RPC_URL || "",
  polygonMumbai: process.env.POLYGON_MUMBAI_RPC_URL || "",
};

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
    hardhat: {
      chainId: 31337,
      forking: {
        url: RPC_URLS.polygonMumbai,
        enabled: true,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },

  dependencyCompiler: {
    paths: [
      "@superfluid-finance/ethereum-contracts/contracts/agreements/ConstantFlowAgreementV1.sol",
      "@superfluid-finance/ethereum-contracts/contracts/utils/CFAv1Forwarder.sol",
    ],
  },
};

export default hardhatUserConfig;
