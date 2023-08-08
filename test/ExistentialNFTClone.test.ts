import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ExistentialNFT, ExistentialNFT__factory } from "../typechain-types";
import { deployments, ethers } from "hardhat";
import { expect } from "chai";
import existentialNFTClone from "../deployments/localhost/ExistentialNFTClone.json";

describe("ExistentialNFTClone", () => {
  let accounts: SignerWithAddress[],
    deployer: SignerWithAddress,
    enft: ExistentialNFT;
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer] = accounts;

    await deployments.fixture(["all"]);

    enft = ExistentialNFT__factory.connect(
      existentialNFTClone.address,
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
});
