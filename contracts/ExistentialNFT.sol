// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

error ExistentialNFT_TransferIsNotAllowed();

struct PaymentOption {
    ISuperToken incomingFlowToken;
    address recipient;
    int96 requiredFlowRate;
    string optionTokenURI;
}

contract ExistentialNFT is ERC721 {
    using SuperTokenV1Library for ISuperToken;

    PaymentOption[] private paymentOptions;

    constructor(
        ISuperToken[] memory incomingFlowTokens,
        address[] memory recipients,
        int96[] memory requiredFlowRates,
        string[] memory optionTokenURIs
    ) ERC721("Superfluid Existential NFT", "SFENFT") {
        for (uint256 i = 0; i < incomingFlowTokens.length; i++) {
            paymentOptions.push(
                PaymentOption(
                    incomingFlowTokens[i],
                    recipients[i],
                    requiredFlowRates[i],
                    optionTokenURIs[i]
                )
            );
        }
    }

    function balanceOf(address owner) public view override returns (uint256) {
        PaymentOption memory paymentOption = getPaymentOptionFor(owner);

        return paymentOption.requiredFlowRate > 0 ? 1 : 0;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        address owner = address(uint160(tokenId));
        PaymentOption memory paymentOption = getPaymentOptionFor(owner);

        return balanceOf(owner) == 0 ? "" : paymentOption.optionTokenURI;
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = address(uint160(tokenId));

        return balanceOf(owner) == 1 ? owner : address(0);
    }

    function transferFrom(address, address, uint256) public pure override {
        revert ExistentialNFT_TransferIsNotAllowed();
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert ExistentialNFT_TransferIsNotAllowed();
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override {
        revert ExistentialNFT_TransferIsNotAllowed();
    }

    function getPaymentOptions() public view returns (PaymentOption[] memory) {
        return paymentOptions;
    }

    function getPaymentOptionFor(
        address owner
    ) public view returns (PaymentOption memory result) {
        for (uint256 i = 0; i < paymentOptions.length; i++) {
            PaymentOption memory paymentOption = paymentOptions[i];
            int96 flowRate = paymentOption.incomingFlowToken.getFlowRate(
                owner,
                paymentOption.recipient
            );

            if (paymentOption.requiredFlowRate <= flowRate && flowRate != 0) {
                result = paymentOption;
            }
        }
    }
}
