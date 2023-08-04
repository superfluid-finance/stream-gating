# Stream Gating

##### The purpose of this repository provides stream gating solutions to <i>users</i> / <i>content-creators</i> / etc. of the `Superfluid` protocol.

### Contracts:
 - <strong>ExistentialNFT</strong>

The "ExistentialNFT" contract is an ERC-721 compliant Non-Fungible Token (NFT) contract that implements token gating based on the existence of a stream with a specific flow rate of a SuperToken. The contract implements the imitation of NFT behavior acting as binary switches, providing or revoking access to gated services or content, based on the balanceOf function.

#### Summary of its functionality:

<b>Payment Options:</b> The contract is deployed with multiple payment options, each represented by the PaymentOption struct. Each payment option specifies a `SuperToken` (incomingFlowToken), a `recipient` (recipient) who will receive the SuperToken payments, a `required flow rate` (requiredFlowRate) for the stream to maintain ownership of the ExistentialNFT token, and an `optionTokenURI` providing the creator with an opportunity to set different images to different payment options.

<b>Token Ownership:</b> The ownership of an ExistentialNFT token is determined by the existence of a stream with a flow rate equal to or higher than the required rate specified in the payment option. If the user has an active stream with the specified SuperToken and the flow rate meets the required amount, they will have a balance of 1 for the ExistentialNFT token, effectively granting ownership and access to the gated services.

<b>Token URI and Content Access:</b> The tokenURI function is used to retrieve the metadata URI of the ExistentialNFT token. If the token is owned (balance is 1), the metadata URI will point to the appropriate (mostly pre-created) token metadata.

<b>Transfer</b> Restriction: The contract overrides the standard ERC-721 transfer functions (transferFrom, safeTransferFrom, safeTransferFrom) to prevent any token transfers. Once an ExistentialNFT token is "minted" (ownership determined), it cannot be transferred to another address.

<b>Token Minting:</b> The contract itself does not include explicit minting functionality. The minting of ExistentialNFT tokens occurs implicitly when users create streams with the required flow rate of the specified SuperToken. As users set up streams, they obtain ownership of the associated (to a PaymentOption) ExistentialNFT token.

### TLDR;
The contract provides a novel way to control access to specific content or services by tying token ownership to the existence of a stream with specific flow rates. As long as users maintain the required flow rates for their streams, they will continue to own the associated ExistentialNFT tokens and retain access to the gated services. If the stream is stopped or the flow rate drops below the required rate, ownership is lost, and access to the services is revoked.


### Technologies / Development

- <b>Typescript<b>
- <b>Hardhat</b>, <b>Hardhat Toolbox</b> and <b>Hardhat Deploy</b>
- <b>Ethers v6</b>

Try running some of the following tasks:

```shell
yarn test
yarn localnode
```
