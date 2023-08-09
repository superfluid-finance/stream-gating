import { ethers, getNamedAccounts } from "hardhat";
import { ExistentialNFTCloneFactory__factory } from "../typechain-types";
import hre from "hardhat";
import networks from "../helper-hardhat.config";

const deployClone = async () => {
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.provider.getSigner(deployer);
  const { network, deployments } = hre;

  const config = networks[network.config.chainId!];

  const existentialNFTCloneFactoryDeployment = await deployments.get(
    "ExistentialNFTCloneFactory"
  );

  const existentialNFTFactory = ExistentialNFTCloneFactory__factory.connect(
    existentialNFTCloneFactoryDeployment.address,
    signer
  );

  const tx = await existentialNFTFactory.deployClone(
    config.superTokens.map(({ address }) => address),
    config.recipients,
    config.requiredFlowRates,
    config.optionTokenURIs,
    config.tokenName,
    config.tokenSymbol
  );

  tx.wait();

  const cloneAddress = (await existentialNFTFactory.getClones())[-1];

  console.info(`ExistentialNFTClone deployed at ${cloneAddress}`);
};

// export default deployClone;

deployClone();
