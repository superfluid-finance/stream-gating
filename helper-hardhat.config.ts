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
  totalSupply: number;
  superToken: SuperTokenInfo;
  hostAddress: Address;
  cfaV1ForwarderAddress: Address;
  recipient: Address;
  requiredFlowRate: BigInt;
  singletonTokenURI: string;
};

const polygonMumbaiConfig: NetworkConfig = {
  name: "polygon",
  totalSupply: 0,
  superToken: fUSDCx,
  hostAddress: polygonMumbai.contractsV1.host as Address,
  cfaV1ForwarderAddress: polygonMumbai.contractsV1.cfaV1Forwarder as Address,
  recipient: "0x",
  requiredFlowRate: BigInt(0),
  singletonTokenURI: "",
};

const hardhatConfig: NetworkConfig = {
  ...polygonMumbaiConfig,
  name: "hardhat",
  totalSupply: 1,
  recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  requiredFlowRate: BigInt(Math.floor(MONTH_IN_SECONDS / 30)),
  singletonTokenURI: "https://ipfs.io/someIPFSHash",
};

const networks: Record<number, NetworkConfig> = {
  // 137: polygonConfig,
  80001: polygonMumbaiConfig,
  31337: hardhatConfig,
};

export const developmentChains = ["hardhat", "localhost"];

export default networks;
