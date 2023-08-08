import { SuperTokenInfo } from "@superfluid-finance/tokenlist";
import { ethers } from "hardhat";
import {
  ERC20WithTokenInfo__factory,
  ISuperToken__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { TransactionRequest, parseEther } from "ethers";

export const mintWrapperSuperToken = async (
  superTokenInfo: SuperTokenInfo,
  to: SignerWithAddress
) => {
  const superToken = ISuperToken__factory.connect(superTokenInfo.address, to);

  const underlyingAddress =
    superTokenInfo.extensions.superTokenInfo.type == "Wrapper"
      ? superTokenInfo.extensions.superTokenInfo.underlyingTokenAddress
      : "";

  const underlyingToken = new ethers.Contract(
    underlyingAddress,
    ERC20WithTokenInfo__factory.abi,
    to
  );

  const iface = new ethers.Interface([
    "function mint(address account, uint256 amount) public returns (bool)",
  ]);

  const data = iface.encodeFunctionData("mint", [
    to.address,
    parseEther("100"),
  ]);

  const request: TransactionRequest = {
    to: underlyingAddress,
    from: to,
    data,
  };

  try {
    let tx = await to.sendTransaction(request);
    let rc = await tx.wait();

    tx = await underlyingToken.approve(
      superTokenInfo.address,
      parseEther("100")
    );
    rc = await tx.wait();

    await superToken.upgrade(parseEther("100"));
  } catch {
    console.log("SuperToken minting failed");
  }
};
