import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import verify from "../utils/verify";
import networkConfig, { developmentChains } from "../helper-hardhat.config";
import {
  ExistentialNFTCloneFactory__factory,
  ExistentialNFT__factory,
} from "../typechain-types";
import { ethers } from "hardhat";

const CONTRACT_NAME = "ExistentialNFTCloneFactory";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);

  log(`Deploying ${CONTRACT_NAME} and waiting for confirmations...`);

  const config = networkConfig[network.config.chainId!];

  const existentialNFTDeployment = await deployments.get("ExistentialNFT");

  const args: any = [existentialNFTDeployment.address];

  const existentialNFTCloneFactory = await deploy(CONTRACT_NAME, {
    from: deployer,
    args,
    log: true,
    waitConfirmations: developmentChains.includes(network.name) ? 1 : 5,
  });

  log(`${CONTRACT_NAME} deployed at ${existentialNFTCloneFactory.address}`);

  const enftCloneFactory = ExistentialNFTCloneFactory__factory.connect(
    existentialNFTCloneFactory.address,
    signer
  );

  const initArgs: any = [
    config.superTokens.map(({ address }) => address),
    config.recipients,
    config.requiredFlowRates,
    config.optionTokenURIs,
  ];

  const enftClone = await enftCloneFactory.deployClone(...initArgs);

  const implementation = await enftCloneFactory.implementation();

  log(`ExistentialNFT clone deployed at ${implementation}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(existentialNFTCloneFactory.address, args);
  }
};
export default deploy;

deploy.tags = ["all", "enft"];
