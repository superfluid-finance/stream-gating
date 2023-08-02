// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

error ExistentialNFT_TransferIsNotAllowed();
error ExistentialNFT_MintingIsNotAllowed();

contract ExistentialNFT is ERC721 {
    using SuperTokenV1Library for ISuperToken;

    ISuperToken private immutable incomingFlowToken;
    address private immutable recipient;
    int96 private immutable requiredFlowRate;

    string private singletonTokenURI;

    constructor(
        ISuperToken _incomingFlowToken,
        address _recipient,
        int96 _requiredFlowRate,
        string memory _singletonTokenURI
    ) ERC721("Superfluid Existential NFT", "SFENFT") {
        incomingFlowToken = _incomingFlowToken;
        recipient = _recipient;
        requiredFlowRate = _requiredFlowRate;

        singletonTokenURI = _singletonTokenURI;
    }

    function mint(address) public pure {
        revert ExistentialNFT_MintingIsNotAllowed();
    }

    function balanceOf(address owner) public view override returns (uint256) {
        int96 flowRate = incomingFlowToken.getFlowRate(owner, recipient);

        // TODO: <= vs !=
        if (flowRate != requiredFlowRate) {
            return 0;
        }

        return 1;
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return singletonTokenURI;
    }

    function ownerOf(uint256 tokenId) public pure override returns (address) {
        return address(uint160(tokenId));
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
}
