import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import verify from "../utils/verify";
import networkConfig, { developmentChains } from "../helper-hardhat.config";

const CONTRACT_NAME = "ExistentialNFT";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log(`Deploying ${CONTRACT_NAME} and waiting for confirmations...`);

  const config = networkConfig[network.config.chainId!];

  const args: any = [
    config.superToken.address,
    config.recipient,
    config.requiredFlowRate,
    config.singletonTokenURI,
  ];

  const existentialNFT = await deploy(CONTRACT_NAME, {
    from: deployer,
    args,
    log: true,
    waitConfirmations: developmentChains.includes(network.name) ? 1 : 5,
  });

  log(`${CONTRACT_NAME} deployed at ${existentialNFT.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(existentialNFT.address, args);
  }
};
export default deploy;

deploy.tags = ["all", "enft"];
