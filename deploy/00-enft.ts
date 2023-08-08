import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import verify from "../utils/verify";
import networkConfig, { developmentChains } from "../helper-hardhat.config";
import { ExistentialNFT__factory } from "../typechain-types";
import { ethers } from "hardhat";

const CONTRACT_NAME = "ExistentialNFT";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);

  log(`Deploying ${CONTRACT_NAME} and waiting for confirmations...`);

  const config = networkConfig[network.config.chainId!];

  const args: any = [
    config.superTokens.map(({ address }) => address),
    config.recipients,
    config.requiredFlowRates,
    config.optionTokenURIs,
  ];

  const existentialNFT = await deploy(CONTRACT_NAME, {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: developmentChains.includes(network.name) ? 1 : 5,
  });

  log(`${CONTRACT_NAME} deployed at ${existentialNFT.address}`);

  const enft = ExistentialNFT__factory.connect(existentialNFT.address, signer);

  await enft.initialize(...args);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(existentialNFT.address, args);
  }
};
export default deploy;

deploy.tags = ["all", "enft"];
