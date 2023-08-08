// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

error ExistentialNFT_TransferIsNotAllowed();
error ExistentialNFT_AlreadyInitialized();

struct PaymentOption {
    ISuperToken incomingFlowToken;
    address recipient;
    int96 requiredFlowRate;
    string optionTokenURI;
}

/**
 * @author Superfluid Finance
 * @notice Non-mintable NFT contract that is owned by a user as long as they have a positive flow rate
 * @dev Mirrors the Superfluid Checkout-Builder interface
 */
contract ExistentialNFT is ERC721 {
    using SuperTokenV1Library for ISuperToken;

    PaymentOption[] private paymentOptions;
    bool private initialized;

    constructor() ERC721("ExistentialNFT", "ENFT") {}

    /**
     * @notice Initializes the contract setting the given PaymentOptions
     * @dev Array parameters should be the same size.
     */
    function initialize(
        ISuperToken[] memory incomingFlowTokens,
        address[] memory recipients,
        int96[] memory requiredFlowRates,
        string[] memory optionTokenURIs
    ) external {
        if (initialized) {
            revert ExistentialNFT_AlreadyInitialized();
        }

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

        initialized = true;
    }

    /**
     * @notice Overridden balanceOf, returning a value depending on the flow rate of the owner
     * @dev See {IERC721-balanceOf}.
     * @return 1 if the owner has a positive flow rate, 0 otherwise
     */
    function balanceOf(address owner) public view override returns (uint256) {
        PaymentOption memory paymentOption = getPaymentOptionFor(owner);

        return paymentOption.requiredFlowRate > 0 ? 1 : 0;
    }

    /**
     * @notice Overridden tokenURI, returning an depending on the flow rate of the owner
     * @param tokenId - is the address of the owner
     * @dev See {IERC721-tokenURI}.
     * @return tokenURI - of the owner if they have a positive flow rate, otherwise an empty string
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        address owner = address(uint160(tokenId));
        PaymentOption memory paymentOption = getPaymentOptionFor(owner);

        return balanceOf(owner) == 0 ? "" : paymentOption.optionTokenURI;
    }

    /**
     * @notice Overridden ownerOf, determines the owner, depending flow rate
     * @param tokenId - is the address of the owner
     * @return @param owner - if they have a positive flow rate, otherwise zero address
     */
    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = address(uint160(tokenId));

        return balanceOf(owner) == 1 ? owner : address(0);
    }

    /**
     * @notice This NFT is not transferable
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(address, address, uint256) public pure override {
        revert ExistentialNFT_TransferIsNotAllowed();
    }

    /**
     * @notice This NFT is not transferable
     * @dev See {IERC721-safeTransferFrom}
     */
    function safeTransferFrom(address, address, uint256) public pure override {
        revert ExistentialNFT_TransferIsNotAllowed();
    }

    /**
     * @notice This NFT is not transferable
     * @dev See {IERC721-safeTransferFrom}
     */
    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override {
        revert ExistentialNFT_TransferIsNotAllowed();
    }

    /**
     * @notice get all configured PaymentOptions
     * @return PaymentOption[] - all configured PaymentOptions
     */
    function getPaymentOptions() public view returns (PaymentOption[] memory) {
        return paymentOptions;
    }

    /**
     * @notice match the owner to a PaymentOption
     * @param owner -  the address of the owner
     * @dev @param result is initialized as an empty PaymentOption, so that if no match is found, an empty PaymentOption is returned
     *                    if a match is found, it is assigned to @param result, the loop is not broken, so that the last match is returned.
     * @return result PaymentOption - the PaymentOption that matches the owner or an empty PaymentOption
     */
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
