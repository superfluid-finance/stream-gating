import { HardhatUserConfig } from "hardhat/config";
import { config } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-dependency-compiler";
import { ethers } from "ethers";

config();

const SUPERFLUD_RPC_HOST = process.env.SUPERFLUID_RPC_HOST || "";

const BLOCK_EXPLORER_API_KEYS = {
  arbiScan: process.env.ARBISCAN_API_KEY || "",
  // avaScan: process.env.AVASCAN_API_KEY || "",
  baseScan: process.env.BASESCAN_API_KEY || "",
  bscScan: process.env.BSCSCAN_API_KEY || "",
  celoScan: process.env.CELOSCAN_API_KEY || "",
  etherScan: process.env.ETHERSCAN_API_KEY || "",
  gnosisScan: process.env.GNOSISSCAN_API_KEY || "",
  optimistic: process.env.OPTIMISTIC_API_KEY || "",
  polygonScan: process.env.POLYGONSCAN_API_KEY || "",
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
      url: `${SUPERFLUD_RPC_HOST}/base-mainnet`,
    },
    "bsc-mainnet": {
      accounts,
      chainId: 56,
      url: `${SUPERFLUD_RPC_HOST}/bsc-mainnet`,
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
    "arbitrum-goerli": {
      accounts,
      chainId: 421611,
      url: `${SUPERFLUD_RPC_HOST}/arbitrum-goerli`,
    },
    "avalanche-fuji": {
      accounts,
      chainId: 43113,
      url: `${SUPERFLUD_RPC_HOST}/avalanche-fuji`,
    },
    "base-goerli": {
      accounts,
      chainId: 84531,
      url: `${SUPERFLUD_RPC_HOST}/base-goerli`,
    },
    "eth-goerli": {
      accounts,
      chainId: 5,
      url: `${SUPERFLUD_RPC_HOST}/eth-goerli`,
    },
    "optimism-goerli": {
      accounts,
      chainId: 420,
      url: `${SUPERFLUD_RPC_HOST}/optimism-goerli`,
    },
    "polygon-mumbai": {
      accounts,
      chainId: 80001,
      url: `${SUPERFLUD_RPC_HOST}/polygon-mumbai`,
    },
    "polygon-zkevm-testnet": {
      accounts,
      chainId: 1101,
      url: `${SUPERFLUD_RPC_HOST}/polygon-zkevm-testnet`,
    },
    "eth-sepolia": {
      accounts,
      chainId: 69,
      url: `${SUPERFLUD_RPC_HOST}/eth-sepolia`,
    },
    // local
    hardhat: {
      chainId: 31337,
      forking: {
        url: `${SUPERFLUD_RPC_HOST}/polygon-mumbai`,
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
      "avalanche-c": "avascan",
      "base-mainnet": BLOCK_EXPLORER_API_KEYS.baseScan,
      bscMainnet: BLOCK_EXPLORER_API_KEYS.bscScan,
      "celo-mainnet": BLOCK_EXPLORER_API_KEYS.celoScan,
      mainnet: BLOCK_EXPLORER_API_KEYS.etherScan,
      "xdai-mainnet": BLOCK_EXPLORER_API_KEYS.gnosisScan,
      optimisticEthereum: BLOCK_EXPLORER_API_KEYS.optimistic,
      polygon: BLOCK_EXPLORER_API_KEYS.polygonScan,
      // testnets
      "arbitrum-goerli": BLOCK_EXPLORER_API_KEYS.arbiScan,
      "avalanche-fuji": "avascan",
      "base-goerli": BLOCK_EXPLORER_API_KEYS.baseScan,
      "eth-goerli": BLOCK_EXPLORER_API_KEYS.etherScan,
      "optimism-goerli": BLOCK_EXPLORER_API_KEYS.optimistic,
      polygonMumbai: BLOCK_EXPLORER_API_KEYS.polygonScan,
      "polygon-zkevm-testnet": BLOCK_EXPLORER_API_KEYS.polygonScan,
      "eth-sepolia": BLOCK_EXPLORER_API_KEYS.etherScan,
    },
    customChains: [
      {
        network: "avalanche-c",
        chainId: 43114,
        urls: {
          apiURL:
            "https://api.avascan.info/v2/network/mainnet/evm/43114/etherscan",
          browserURL: "https://avascan.info/blockchain/c",
        },
      },
      {
        network: "avalanche-fuji",
        chainId: 43113,
        urls: {
          apiURL:
            "https://api.avascan.info/v2/network/testnet/evm/43113/etherscan",
          browserURL: "https://testnet.avascan.info/blockchain/fuji",
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
