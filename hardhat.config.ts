import { HardhatUserConfig } from "hardhat/config";
import { config } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-dependency-compiler";
import { ethers } from "ethers";

config();

const RPC_URLS = {
  arbitrum: process.env.ARBITRUM_RPC_URL || "",
  avalanche: process.env.AVALANCHE_RPC_URL || "",
  base: process.env.BASE_RPC_URL || "",
  bsc: process.env.BSC_RPC_URL || "",
  celo: process.env.CELO_RPC_URL || "",
  ethereum: process.env.ETHEREUM_RPC_URL || "",
  gnosis: process.env.GNOSIS_RPC_URL || "",
  optimism: process.env.OPTIMISM_RPC_URL || "",
  polygon: process.env.POLYGON_RPC_URL || "",
};

const TESTNET_RPC_URLS = {
  arbitrumGoerli: process.env.ARBITRUM_GOERLI_RPC_URL || "",
  avalancheFuji: process.env.AVALANCHE_FUJI_RPC_URL || "",
  baseGoerli: process.env.BASE_GOERLI_RPC_URL || "",
  goerli: process.env.GOERLI_RPC_URL || "",
  optimismGoerli: process.env.OPTIMISM_GOERLI_RPC_URL || "",
  polygonMumbai: process.env.POLYGON_MUMBAI_RPC_URL || "",
  polygonZKEVM: process.env.POLYGON_ZKEVM_RPC_URL || "",
  sepolia: process.env.SEPOLIA_RPC_URL || "",
};

const BLOCK_EXPLORER_API_KEYS = {
  arbiScan: process.env.ARBISCAN_API_KEY || "",
  avaScan: process.env.AVASCAN_API_KEY || "",
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
const PRIVATE_KEY =
  process.env.PRIVATE_KEY || ethers.Wallet.createRandom().privateKey;

const accounts = {
  mnemonic: MNEMONIC,
  count: 20,
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
    arbitrum: {
      accounts,
      chainId: 42161,
      url: RPC_URLS.base,
    },
    avalanche: {
      accounts,
      chainId: 43114,
      url: RPC_URLS.base,
    },
    base: {
      accounts,
      chainId: 8453,
      url: RPC_URLS.base,
    },
    bsc: {
      accounts,
      chainId: 56,
      url: RPC_URLS.base,
    },
    ethereum: {
      accounts,
      chainId: 1,
      url: RPC_URLS.ethereum,
    },
    gnosis: {
      accounts,
      chainId: 100,
      url: RPC_URLS.gnosis,
    },
    optimism: {
      accounts,
      chainId: 10,
      url: RPC_URLS.optimism,
    },
    polygon: {
      accounts,
      chainId: 137,
      url: RPC_URLS.polygon,
    },
    // testnets
    arbitrumGoerli: {
      accounts,
      chainId: 421611,
      url: TESTNET_RPC_URLS.arbitrumGoerli,
    },
    avalancheFuji: {
      accounts,
      chainId: 43113,
      url: TESTNET_RPC_URLS.avalancheFuji,
    },
    baseGoerli: {
      accounts,
      chainId: 84531,
      url: TESTNET_RPC_URLS.baseGoerli,
    },
    goerli: {
      accounts,
      chainId: 5,
      url: TESTNET_RPC_URLS.goerli,
    },
    optimismGoerli: {
      accounts,
      chainId: 420,
      url: TESTNET_RPC_URLS.optimismGoerli,
    },
    polygonZKEVM: {
      accounts,
      chainId: 1101,
      url: TESTNET_RPC_URLS.polygonZKEVM,
    },
    polygonMumbai: {
      chainId: 80001,
      url: TESTNET_RPC_URLS.polygonMumbai,
    },
    sepolia: {
      accounts,
      chainId: 69,
      url: TESTNET_RPC_URLS.sepolia,
    },
    // local
    hardhat: {
      chainId: 31337,
      forking: {
        url: TESTNET_RPC_URLS.polygonMumbai,
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
      arbitrum: BLOCK_EXPLORER_API_KEYS.arbiScan,
      avalanche: BLOCK_EXPLORER_API_KEYS.avaScan,
      base: BLOCK_EXPLORER_API_KEYS.baseScan,
      bsc: BLOCK_EXPLORER_API_KEYS.bscScan,
      celo: BLOCK_EXPLORER_API_KEYS.celoScan,
      ethereum: BLOCK_EXPLORER_API_KEYS.etherScan,
      gnosis: BLOCK_EXPLORER_API_KEYS.gnosisScan,
      optimism: BLOCK_EXPLORER_API_KEYS.optimistic,
      polygon: BLOCK_EXPLORER_API_KEYS.polygonScan,
      // testnets
      arbitrumGoerli: BLOCK_EXPLORER_API_KEYS.arbiScan,
      avalancheFuji: BLOCK_EXPLORER_API_KEYS.avaScan,
      baseGoerli: BLOCK_EXPLORER_API_KEYS.baseScan,
      goerli: BLOCK_EXPLORER_API_KEYS.etherScan,
      optimismGoerli: BLOCK_EXPLORER_API_KEYS.optimistic,
      polygonZKEVM: BLOCK_EXPLORER_API_KEYS.polygonScan,
      polygonMumbai: BLOCK_EXPLORER_API_KEYS.polygonScan,
      sepolia: BLOCK_EXPLORER_API_KEYS.etherScan,
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
