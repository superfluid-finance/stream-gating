import { HardhatUserConfig } from "hardhat/config";
import { config } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-dependency-compiler";
import { ethers } from "ethers";

config();

const SUPERFLUD_RPC_HOST = process.env.SUPERFLUID_RPC_HOST || "";
const RPC_FORK_URL = process.env.RPC_FORK_URL || "";

const BLOCK_EXPLORER_API_KEYS = {
  arbiScan: process.env.ARBISCAN_API_KEY || "",
  snowTrace: process.env.SNOWTRACE_API_KEY || "",
  baseScan: process.env.BASESCAN_API_KEY || "",
  bscScan: process.env.BSCSCAN_API_KEY || "",
  celoScan: process.env.CELOSCAN_API_KEY || "",
  etherScan: process.env.ETHERSCAN_API_KEY || "",
  gnosisScan: process.env.GNOSISSCAN_API_KEY || "",
  optimistic: process.env.OPTIMISTIC_API_KEY || "",
  polygonScan: process.env.POLYGONSCAN_API_KEY || "",
  polygonScanZKEVM: process.env.POLYGONSCAN_ZKEVM_API_KEY || "",
};

const MNEMONIC =
  process.env.MNEMONIC ||
  "test test test test test test test test test test test junk";
const PRIVATE_KEY = MNEMONIC
  ? ethers.Wallet.fromPhrase(MNEMONIC).privateKey
  : ethers.Wallet.createRandom().privateKey;

const accounts = {
  mnemonic: MNEMONIC,
  count: 1,
  initialIndex: 0,
  path: "m/44'/60'/0'/0",
  passphrase: "",
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
    // mainnets
    "arbitrum-one": {
      accounts,
      chainId: 42161,
      url: `${SUPERFLUD_RPC_HOST}/arbitrum-one`,
    },
    "avalanche-c": {
      accounts,
      chainId: 43114,
      url: `${SUPERFLUD_RPC_HOST}/avalanche-c`,
    },
    "base-mainnet": {
      accounts,
      chainId: 8453,
      url: "https://mainnet.base.org", // `${SUPERFLUD_RPC_HOST}/base-mainnet`,
    },
    "bsc-mainnet": {
      accounts,
      chainId: 56,
      url: `${SUPERFLUD_RPC_HOST}/bsc-mainnet`,
    },
    "celo-mainnet": {
      accounts,
      chainId: 42220,
      url: `${SUPERFLUD_RPC_HOST}/celo-mainnet`,
    },
    "eth-mainnet": {
      accounts,
      chainId: 1,
      url: `${SUPERFLUD_RPC_HOST}/eth-mainnet`,
    },
    "xdai-mainnet": {
      accounts,
      chainId: 100,
      url: `${SUPERFLUD_RPC_HOST}/xdai-mainnet`,
    },
    "optimism-mainnet": {
      accounts,
      chainId: 10,
      url: `${SUPERFLUD_RPC_HOST}/optimism-mainnet`,
    },
    "polygon-mainnet": {
      accounts,
      chainId: 137,
      url: `${SUPERFLUD_RPC_HOST}/polygon-mainnet`,
    },
    // testnets
    "avalanche-fuji": {
      accounts,
      chainId: 43113,
      url: `${SUPERFLUD_RPC_HOST}/avalanche-fuji`,
    },
    "polygon-mumbai": {
      accounts,
      chainId: 80001,
      url: `${SUPERFLUD_RPC_HOST}/polygon-mumbai`,
    },
    "eth-sepolia": {
      accounts,
      chainId: 11155111,
      url: `${SUPERFLUD_RPC_HOST}/eth-sepolia`,
    },
    // local
    hardhat: {
      chainId: 31337,
      forking: {
        url: RPC_FORK_URL,
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
      // mainnets
      arbitrumOne: BLOCK_EXPLORER_API_KEYS.arbiScan,
      avalanche: BLOCK_EXPLORER_API_KEYS.snowTrace,
      "base-mainnet": BLOCK_EXPLORER_API_KEYS.baseScan,
      bsc: BLOCK_EXPLORER_API_KEYS.bscScan,
      "celo-mainnet": BLOCK_EXPLORER_API_KEYS.celoScan,
      mainnet: BLOCK_EXPLORER_API_KEYS.etherScan,
      xdai: BLOCK_EXPLORER_API_KEYS.gnosisScan,
      optimisticEthereum: BLOCK_EXPLORER_API_KEYS.optimistic,
      polygon: BLOCK_EXPLORER_API_KEYS.polygonScan,
      // testnets
      avalancheFujiTestnet: BLOCK_EXPLORER_API_KEYS.snowTrace,
      polygonMumbai: BLOCK_EXPLORER_API_KEYS.polygonScan,
      "polygon-zkevm-testnet": BLOCK_EXPLORER_API_KEYS.polygonScanZKEVM,
      sepolia: BLOCK_EXPLORER_API_KEYS.etherScan,
    },
    customChains: [
      {
        network: "celo-mainnet",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
      {
        network: "polygon-zkevm-testnet",
        chainId: 1442,
        urls: {
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com",
        },
      },
      {
        network: "base-mainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
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
