import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import verify from "../utils/verify";
import networkConfig, { developmentChains } from "../helper-hardhat.config";
import { ExistentialNFTCloneFactory__factory } from "../typechain-types";
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import hardhatUserConfig from "../hardhat.config";

const CONTRACT_NAME = "ExistentialNFTCloneFactory";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const [signer] = await ethers.getSigners();

  log(`Deploying ${CONTRACT_NAME} and waiting for confirmations...`);

  const config = networkConfig[network.config.chainId!];

  const existentialNFTDeployment = await deployments.get("ExistentialNFT");

  const args: any = [existentialNFTDeployment.address];

  const existentialNFTCloneFactory = await deploy(CONTRACT_NAME, {
    from: signer.address,
    args,
    log: true,
    waitConfirmations: developmentChains.includes(network.name) ? 1 : 5,
  });

  log(`${CONTRACT_NAME} deployed at ${existentialNFTCloneFactory.address}`);

  if (developmentChains.includes(network.name)) {
    const initArgs: any = [
      config.superTokens.map(({ address }) => address),
      config.recipients,
      config.requiredFlowRates,
      config.tokenName,
      config.tokenSymbol,
      config.tokenURI,
    ];

    const enftCloneFactory = ExistentialNFTCloneFactory__factory.connect(
      existentialNFTCloneFactory.address,
      signer
    );

    const tx = await enftCloneFactory.deployClone(...initArgs);
    const rc = await tx.wait();

    if (rc) {
      process.env.EXISTENTIAL_NFT_CLONE_ADDRESS =
        "0x0a34ce6675e827826cefdc8d4ca0723e18fbbfe3";
    }
  }

  const apiKeys = hardhatUserConfig.etherscan?.apiKey!;

  if (!developmentChains.includes(network.name)) {
    await verify(existentialNFTCloneFactory.address, args);
  }
};
export default deploy;

deploy.tags = ["all", "enft"];
