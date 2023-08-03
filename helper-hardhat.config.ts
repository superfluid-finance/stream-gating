import tokenList, { SuperTokenInfo } from "@superfluid-finance/tokenlist";
import metaData from "@superfluid-finance/metadata";
import { MONTH_IN_SECONDS } from "./utils/time";

type Address = `0x${string}`;
type NetworkName = "hardhat" | "localhost" | "polygon" | "polygonMumbai";

const fUSDCx = tokenList.tokens.find(
  (token) => token.symbol === "fUSDCx" && token.chainId === 80001
)!;

const polygonMumbai = metaData.getNetworkByChainId(80001)!;

export type NetworkConfig = {
  name: NetworkName;
  superTokens: SuperTokenInfo[];
  hostAddress: Address;
  cfaV1ForwarderAddress: Address;
  recipients: Address[];
  requiredFlowRates: bigint[];
  optionTokenURIs: string[];
};

const polygonMumbaiConfig: NetworkConfig = {
  name: "polygonMumbai",
  superTokens: [fUSDCx, fUSDCx],
  hostAddress: polygonMumbai.contractsV1.host as Address,
  cfaV1ForwarderAddress: polygonMumbai.contractsV1.cfaV1Forwarder as Address,
  recipients: ["0x"],
  requiredFlowRates: [BigInt(0)],
  optionTokenURIs: [""],
};

const hardhatConfig: NetworkConfig = {
  ...polygonMumbaiConfig,
  name: "hardhat",
  recipients: [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  ],
  requiredFlowRates: [
    BigInt(Math.floor(MONTH_IN_SECONDS / 30)),
    2n * BigInt(Math.floor(MONTH_IN_SECONDS / 30)),
  ],
  optionTokenURIs: [
    "https://ipfs.io/someIPFSHash",
    "https://ipfs.io/someOtherIPFSHash",
  ],
};

const networks: Record<number, NetworkConfig> = {
  // 137: polygonConfig,
  80001: polygonMumbaiConfig,
  31337: hardhatConfig,
};

export const developmentChains = ["hardhat", "localhost"];

export default networks;
