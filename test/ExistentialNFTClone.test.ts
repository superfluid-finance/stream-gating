import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  ExistentialNFT,
  ExistentialNFTCloneFactory,
  ExistentialNFTCloneFactory__factory,
  ExistentialNFT__factory,
} from "../typechain-types";
import { deployments, ethers, network } from "hardhat";
import { expect } from "chai";
import networks, { NetworkConfig } from "../helper-hardhat.config";

describe("ExistentialNFTCloneFactory", () => {
  let accounts: SignerWithAddress[],
    deployer: SignerWithAddress,
    enft: ExistentialNFT,
    enftCloneFactory: ExistentialNFTCloneFactory,
    config: NetworkConfig;
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer] = accounts;

    await deployments.fixture(["all"]);

    const existentialNFTCloneAddress =
      process.env.EXISTENTIAL_NFT_CLONE_ADDRESS ?? "";

    const existentialNFTDeployment = await deployments.get(
      "ExistentialNFTCloneFactory"
    );

    config = networks[network.config.chainId!] as NetworkConfig;

    enft = ExistentialNFT__factory.connect(
      existentialNFTCloneAddress,
      deployer
    );

    enftCloneFactory = ExistentialNFTCloneFactory__factory.connect(
      existentialNFTDeployment.address,
      deployer
    );
  });

  describe("Test if ExistentialNFTClone supports the interface", () => {
    it("should return all paymentOptions configured in the contract", async () => {
      const [paymentOption1, paymentOption2] = await enft.getPaymentOptions();

      expect(paymentOption1).to.deep.equal([
        "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        86400n,
        "https://ipfs.io/someIPFSHash",
      ]);

      expect(paymentOption2).to.deep.equal([
        "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        172800n,
        "https://ipfs.io/someOtherIPFSHash",
      ]);
    });
  });

  describe("Name and Symbol", () => {
    it("should have the test token Name", async () => {
      expect(await enft.name()).to.equal("Test NFT");
    });
    it("should have the test token Symbol", async () => {
      expect(await enft.symbol()).to.equal("TST");
    });
  });

  describe("deployClone", () => {
    it("should revert with ExistentialNFTCloneFactory_ArgumentLengthMismatch if arraysizes are mismatched", async () => {
      await expect(
        enftCloneFactory.deployClone(
          config.superTokens.map(({ address }) => address),
          [],
          config.requiredFlowRates,
          config.optionTokenURIs,
          config.tokenName,
          config.tokenSymbol
        )
      ).to.be.revertedWithCustomError(
        enftCloneFactory,
        "ExistentialNFTCloneFactory_ArgumentLengthMismatch"
      );
    });
  });
});
