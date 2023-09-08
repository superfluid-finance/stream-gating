// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

error ExistentialNFT_TransferIsNotAllowed();
error ExistentialNFT_Unauthorized();
error ExistentialNFT_Deprecated(uint256 at);

struct PaymentOption {
    ISuperToken incomingFlowToken;
    address recipient;
    int96 requiredFlowRate;
}

/**
 * @author Superfluid Finance
 * @notice Non-mintable NFT contract that is owned by a user as long as they have a positive flow rate
 * @dev Mirrors the Superfluid Checkout-Builder interface
 */
contract ExistentialNFT is ERC721Upgradeable {
    using SuperTokenV1Library for ISuperToken;
    using Strings for address;
    using Strings for int96;

    PaymentOption[] private paymentOptions;
    string private baseURI;
    uint256 private deprecatedAfter;

    modifier onlyMerchant() {
        if (msg.sender != paymentOptions[0].recipient) {
            revert ExistentialNFT_Unauthorized();
        }
        _;
    }

    /**
     * @notice Initializes the contract setting the given PaymentOptions
     * @dev Array parameters should be the same size.
     */
    function initialize(
        ISuperToken[] memory incomingFlowTokens,
        address[] memory recipients,
        int96[] memory requiredFlowRates,
        string memory name,
        string memory symbol,
        string memory _baseURI
    ) public initializer {
        __ERC721_init(name, symbol);

        for (uint256 i = 0; i < incomingFlowTokens.length; i++) {
            paymentOptions.push(
                PaymentOption(
                    incomingFlowTokens[i],
                    recipients[i],
                    requiredFlowRates[i]
                )
            );

            baseURI = _baseURI;
        }
    }

    function addPaymentOption(
        ISuperToken incomingFlowToken,
        address recipient,
        int96 requiredFlowRate
    ) public onlyMerchant {
        paymentOptions.push(
            PaymentOption(incomingFlowToken, recipient, requiredFlowRate)
        );
    }

    /**
     * @notice set a time, after which subscriptions are considered deprecated
     * 0 means the NFT is never deprecated
     * @dev only the recipient of the first PaymentOption can call this function
     * @param timestamp - the timestamp after which subscriptions are deprecated
     */
    function setDeprecatedAfter(uint256 timestamp) public onlyMerchant {
        deprecatedAfter = timestamp;
    }

    /**
     * @notice Overridden balanceOf, returning a value depending on the flow rate of the owner
     * @dev See {IERC721-balanceOf}.
     * @return 1 if the owner has a positive flow rate, 0 otherwise
     */
    function balanceOf(address owner) public view override returns (uint256) {
        PaymentOption memory paymentOption = getPaymentOptionFor(owner);

        if (paymentOption.incomingFlowToken == ISuperToken(address(0))) {
            return 0;
        }

        (uint256 lastUpdated, , , ) = paymentOption
            .incomingFlowToken
            .getFlowInfo(owner, paymentOption.recipient);

        if (isDeprecated(lastUpdated)) {
            return 0;
        }

        return paymentOption.requiredFlowRate > 0 ? 1 : 0;
    }

    /**
     * @notice Overridden tokenURI, returning the URI set at deployment
     * @param tokenId - is the address of the owner
     * @dev See {IERC721-tokenURI}.
     * @return tokenURI - the tokenURI for the owner
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        address owner = address(uint160(tokenId));
        PaymentOption memory paymentOption = getPaymentOptionFor(owner);

        if (paymentOption.incomingFlowToken == ISuperToken(address(0))) {
            return "";
        }

        (uint256 lastUpdated, , , ) = paymentOption
            .incomingFlowToken
            .getFlowInfo(owner, paymentOption.recipient);

        if (isDeprecated(lastUpdated)) {
            return "";
        }

        return balanceOf(owner) == 0 ? "" : constructTokenURI(owner);
    }

    /**
     * @notice Overridden ownerOf, determines the owner, depending flow rate
     * @param tokenId - is the address of the owner
     * @return @param owner - if they have a positive flow rate, otherwise zero address
     */
    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = address(uint160(tokenId));
        PaymentOption memory paymentOption = getPaymentOptionFor(owner);

        if (paymentOption.incomingFlowToken == ISuperToken(address(0))) {
            return address(0);
        }

        (uint256 lastUpdated, , , ) = paymentOption
            .incomingFlowToken
            .getFlowInfo(owner, paymentOption.recipient);

        if (isDeprecated(lastUpdated)) {
            return address(0);
        }

        return balanceOf(owner) == 1 ? owner : address(0);
    }

    /**
     * @notice get the tokenId for an owner
     * @dev one address can own only one token
     * @param owner - is the address of the owner
     * @return tokenId - the address converted to uint256, 0 if the owner has no positive flow rate
     */
    function tokenOf(address owner) public view returns (uint256) {
        PaymentOption memory paymentOption = getPaymentOptionFor(owner);

        if (paymentOption.incomingFlowToken == ISuperToken(address(0))) {
            return 0;
        }

        (uint256 lastUpdated, , , ) = paymentOption
            .incomingFlowToken
            .getFlowInfo(owner, paymentOption.recipient);

        if (isDeprecated(lastUpdated)) {
            return 0;
        }

        return balanceOf(owner) == 1 ? uint256(uint160(owner)) : 0;
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

    /**
     * @notice Check if the flow is considered deprecated based on the lastUpdated value
     */
    function isDeprecated(uint256 flowLastUpdated) public view returns (bool) {
        return deprecatedAfter > 0 && flowLastUpdated > deprecatedAfter;
    }

    /**
     * @notice construct the tokenURI for an owner
     * @param owner -  the address of the owner
     * @dev add dynamic queryparamaters at the end of the baseURI.
     * @return tokenURI - the tokenURI for the owner
     */
    function constructTokenURI(
        address owner
    ) private view returns (string memory) {
        PaymentOption memory paymentOption = getPaymentOptionFor(owner);

        return
            string.concat(
                baseURI,
                "&symbol=",
                symbol(),
                "&token=",
                address(paymentOption.incomingFlowToken).toHexString(),
                "&sender=",
                owner.toHexString(),
                "&recipient=",
                paymentOption.recipient.toHexString(),
                "&flowrate=",
                paymentOption.requiredFlowRate.toString(),
                "&clone=",
                address(this).toHexString()
            );
    }
}
