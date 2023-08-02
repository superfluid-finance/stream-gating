import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  ExistentialNFT,
  ExistentialNFT__factory,
  ISuperToken,
  ISuperToken__factory,
} from "../typechain-types";
import networks, { NetworkConfig } from "../helper-hardhat.config";
import { deployments, ethers, network } from "hardhat";
import { expect } from "chai";

import { AddressLike, ZeroAddress, parseEther } from "ethers";
import { CFAv1Forwarder__factory } from "../typechain-types/factories/@superfluid-finance/ethereum-contracts/contracts/utils";
import { CFAv1Forwarder } from "../typechain-types/@superfluid-finance/ethereum-contracts/contracts/utils";
import { mintWrapperSuperToken } from "../utils/mint-supertoken";
import { Address } from "hardhat-deploy/types";

describe("ExistentialNFT", () => {
  let accounts: SignerWithAddress[],
    deployer: SignerWithAddress,
    subscriber: SignerWithAddress,
    enft: ExistentialNFT,
    config: NetworkConfig,
    superToken: ISuperToken,
    cfaV1Forwarder: CFAv1Forwarder;
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer, subscriber] = accounts;

    config = networks[network.config.chainId!] as NetworkConfig;

    cfaV1Forwarder = CFAv1Forwarder__factory.connect(
      config.cfaV1ForwarderAddress,
      subscriber
    );

    await deployments.fixture(["all"]);

    const enftContract = await deployments.get("ExistentialNFT");

    enft = ExistentialNFT__factory.connect(enftContract.address, deployer);
    superToken = ISuperToken__factory.connect(
      config.superToken.address,
      subscriber
    );
  });

  describe("mint", () => {
    it("should not allow the NFT to be minted", async () => {
      await expect(enft.mint(subscriber.address)).to.be.revertedWithCustomError(
        enft,
        "ExistentialNFT_MintingIsNotAllowed"
      );
    });
  });

  describe("balanceOf", () => {
    it("should return 0 when the flow is non existant", async () => {
      const balance = await enft.balanceOf(subscriber.address);
      expect(balance).to.equal(0);
    });

    it("should return 0 if the flowRate is different that what's specified in requiredFlowRate", async () => {
      await mintWrapperSuperToken(config.superToken, subscriber); // mint 100 fUSDCx
      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superToken.address,
        subscriber.address,
        deployer.address,
        BigInt(100),
        "0x"
      );

      await tx.wait();

      const [_, flowRate] = await cfaV1Forwarder.getFlowInfo(
        config.superToken.address,
        subscriber.address,
        deployer.address
      );

      expect(flowRate).to.eq(BigInt(100));

      const balance = await enft.balanceOf(subscriber.address);

      expect(balance).to.equal(0);
    });

    it("should return 1 if the flowRate matches what's specified in requiredFlowRate", async () => {
      await mintWrapperSuperToken(config.superToken, subscriber); // mint 100 fUSDCx

      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superToken.address,
        subscriber.address,
        deployer.address,
        config.requiredFlowRate.toString(),
        "0x"
      );

      await tx.wait();

      const [_, flowRate] = await cfaV1Forwarder.getFlowInfo(
        config.superToken.address,
        subscriber.address,
        deployer.address
      );

      expect(flowRate).to.eq(config.requiredFlowRate);

      const balance = await enft.balanceOf(subscriber.address);

      expect(balance).to.equal(1);
    });
  });

  describe("ownerOf", () => {
    it("should return the tokenId converted to an address", async () => {
      const owner = await enft.ownerOf(1);

      expect(owner).to.equal(BigInt(ZeroAddress) + BigInt(1));
    });

    it("should return the correct owner", async () => {
      const owner = await enft.ownerOf(subscriber.address);

      expect(owner).to.equal(subscriber.address);
    });
  });

  describe("tokenURI", () => {
    it("should return a single tokenURI, disregarding the passed tokenId", async () => {
      const token1 = await enft.tokenURI(1);
      const token2 = await enft.tokenURI(2);

      expect(token1).to.equal(token2);
      expect(token1).to.equal(config.singletonTokenURI);
      expect(token2).to.equal(config.singletonTokenURI);
    });
  });

  describe("transfer", () => {
    it("should not allow the NFT to be transfered", async () => {
      await expect(
        enft.transferFrom(ZeroAddress, ZeroAddress, 1)
      ).to.be.revertedWithCustomError(
        enft,
        "ExistentialNFT_TransferIsNotAllowed"
      );
    });

    it("should not allow the NFT to be safeTransfered", async () => {
      await expect(
        enft["safeTransferFrom(address,address,uint256)"](
          ZeroAddress,
          ZeroAddress,
          1
        )
      ).to.be.revertedWithCustomError(
        enft,
        "ExistentialNFT_TransferIsNotAllowed"
      );

      await expect(
        enft["safeTransferFrom(address,address,uint256,bytes)"](
          ZeroAddress,
          ZeroAddress,
          1,
          "0x"
        )
      ).to.be.revertedWithCustomError(
        enft,
        "ExistentialNFT_TransferIsNotAllowed"
      );
    });
  });
});
