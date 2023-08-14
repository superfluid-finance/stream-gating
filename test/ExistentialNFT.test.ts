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

import { ZeroAddress, parseEther } from "ethers";
import { CFAv1Forwarder__factory } from "../typechain-types/factories/@superfluid-finance/ethereum-contracts/contracts/utils";
import { CFAv1Forwarder } from "../typechain-types/@superfluid-finance/ethereum-contracts/contracts/utils";
import { mintWrapperSuperToken } from "../utils/mint-supertoken";

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
      config.superTokens[0].address,
      subscriber
    );
  });

  describe("getPaymentOptions", () => {
    it("should return all paymentOptions configured in the contract", async () => {
      const [paymentOption1, paymentOption2] = await enft.getPaymentOptions();

      expect(paymentOption1).to.deep.equal([
        "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7",
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        86400n,
      ]);

      expect(paymentOption2).to.deep.equal([
        "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        172800n,
      ]);
    });
  });

  describe("getPaymentOptionFor", () => {
    it("should return empty paymentOption if there is no stream.", async () => {
      const paymentOption = await enft.getPaymentOptionFor(subscriber.address);

      expect(paymentOption).to.deep.equal([ZeroAddress, ZeroAddress, 0n]);
    });

    it("should return the appropriate paymentOption according to flowRate(86400)", async () => {
      await mintWrapperSuperToken(config.superTokens[0], subscriber); // mint 100 fUSDCx
      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0],
        config.requiredFlowRates[0],
        "0x"
      );

      await tx.wait();

      const paymentOption = await enft.getPaymentOptionFor(subscriber.address);

      // flowRate is 86400
      expect(paymentOption[2]).to.equal(86400n);
    });

    it("should return the appropriate paymentOption according to flowRate(172800)", async () => {
      await mintWrapperSuperToken(config.superTokens[0], subscriber); // mint 100 fUSDCx
      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superTokens[1].address,
        subscriber.address,
        config.recipients[1],
        config.requiredFlowRates[1],
        "0x"
      );

      await tx.wait();

      const paymentOption = await enft.getPaymentOptionFor(subscriber.address);

      // flowRate is 172800
      expect(paymentOption[2]).to.equal(172800n);
    });
  });

  describe("balanceOf", () => {
    it("should return 0 when the flow is non existant", async () => {
      const balance = await enft.balanceOf(subscriber.address);
      expect(balance).to.equal(0);
    });

    it("should return 0 if the flowRate is less that what's specified in requiredFlowRate", async () => {
      await mintWrapperSuperToken(config.superTokens[0], subscriber); // mint 100 fUSDCx
      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0],
        config.requiredFlowRates[0] - 1n,
        "0x"
      );

      await tx.wait();

      const [_, flowRate] = await cfaV1Forwarder.getFlowInfo(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0]
      );

      expect(flowRate).to.eq(86399n);

      const balance = await enft.balanceOf(subscriber.address);

      expect(balance).to.equal(0);
    });

    it("should return 1 if the flowRate is greater than what's specified in requiredFlowRate", async () => {
      await mintWrapperSuperToken(config.superTokens[0], subscriber); // mint 100 fUSDCx
      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0],
        config.requiredFlowRates[0] + 1n,
        "0x"
      );

      await tx.wait();

      const [_, flowRate] = await cfaV1Forwarder.getFlowInfo(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0]
      );

      expect(flowRate).to.eq(86401n);

      const balance = await enft.balanceOf(subscriber.address);

      expect(balance).to.equal(1);
    });

    it("should return 1 if the flowRate matches what's specified in requiredFlowRate", async () => {
      await mintWrapperSuperToken(config.superTokens[0], subscriber); // mint 100 fUSDCx

      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0],
        config.requiredFlowRates[0].toString(),
        "0x"
      );

      await tx.wait();

      const [_, flowRate] = await cfaV1Forwarder.getFlowInfo(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0]
      );

      expect(flowRate).to.eq(config.requiredFlowRates[0]);

      const balance = await enft.balanceOf(subscriber.address);

      expect(balance).to.equal(1);
    });
  });

  describe("ownerOf", () => {
    it("should return zeroAddress on arbitrary tokenId", async () => {
      const owner = await enft.ownerOf(1);

      expect(owner).to.equal(BigInt(ZeroAddress));
    });

    it("should return the correct owner", async () => {
      await mintWrapperSuperToken(config.superTokens[0], subscriber); // mint 100 fUSDCx

      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0],
        config.requiredFlowRates[0].toString(),
        "0x"
      );

      await tx.wait();

      const owner = await enft.ownerOf(subscriber.address);

      expect(owner).to.equal(subscriber.address);
    });
  });

  describe("tokenOf", () => {
    it("should return zero on arbitrary address", async () => {
      const token = await enft.tokenOf(ZeroAddress);

      expect(token).to.equal(0);
    });

    it("should return an address converted to a tokenId if the user has a positive balance", async () => {
      await mintWrapperSuperToken(config.superTokens[0], subscriber); // mint 100 fUSDCx

      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0],
        config.requiredFlowRates[0].toString(),
        "0x"
      );

      await tx.wait();

      const token = await enft.tokenOf(subscriber.address);

      expect(token).to.equal(642829559307850963015472508762062935916233390536n); // yaddress as BigInt
    });
  });

  describe("tokenURI", () => {
    it("should return empty string if there is no stream.", async () => {
      const token1 = await enft.tokenURI(1);

      expect(token1).to.equal("");
    });

    it("should return the appropriate paymentOptions url, when there's an existing stream.", async () => {
      await mintWrapperSuperToken(config.superTokens[0], subscriber); // mint 100 fUSDCx

      expect(await superToken.balanceOf(subscriber.address)).to.eq(
        parseEther("100")
      );

      const tx = await cfaV1Forwarder.createFlow(
        config.superTokens[0].address,
        subscriber.address,
        config.recipients[0],
        config.requiredFlowRates[0].toString(),
        "0x"
      );

      await tx.wait();

      const tokenURI = await enft.tokenURI(subscriber.address);

      expect(tokenURI).to.equal(config.tokenURI);
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
