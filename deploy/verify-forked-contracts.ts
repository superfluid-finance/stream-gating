import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import networkConfig, { developmentChains } from "../helper-hardhat.config";
import { ethers } from "hardhat";
import { ERC20WithTokenInfo__factory } from "../typechain-types";
import hardhatUserConfig from "../hardhat.config";

const verifyContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  if (process.env.NODE_ENV !== "local") {
    return;
  }

  const { network } = hre;

  const config = networkConfig[network.config.chainId!];

  const contractData = [
    ...config.superTokens.map((superToken) => ({
      name: superToken.name,
      address: superToken.address,
    })),
    { name: "host", address: config.hostAddress },
    { name: "cfaV1Forwarder", address: config.cfaV1ForwarderAddress },
  ];
  const bytecodes = await Promise.all(
    contractData.map(({ address }) => ethers.provider.getCode(address))
  );

  bytecodes
    .map((bytecode, i) => ({
      address: contractData[i].address,
      name: contractData[i].name,
      bytecode,
    }))
    .forEach(async ({ bytecode, address, name }) => {
      if (bytecode !== "0x") {
        const contract = ERC20WithTokenInfo__factory.connect(
          address,
          ethers.provider
        );
        console.log(`✅ Contract found at ${address}, with name: ${name}`);
      } else {
        console.error(
          `❌ Contract not found at ${config.superTokens[0].address}, with name: ${name}`
        );
      }
    });
};
export default verifyContracts;

verifyContracts.tags = ["all", "verify"];
