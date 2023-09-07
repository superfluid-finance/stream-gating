// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ExistentialNFT} from "./ExistentialNFT.sol";

error ExistentialNFTCloneFactory_ArgumentLengthMismatch();

contract ExistentialNFTCloneFactory is Ownable {
    using Clones for address;

    address public implementation;

    event ExistentialNFTCloneFactory_CloneDeployed(address indexed clone);
    event ExistentialNFTCloneFactory_ImplementationUpdated(
        address indexed implementation
    );

    constructor(address _implementation) Ownable() {
        implementation = _implementation;
    }

    function deployClone(
        ISuperToken[] memory incomingFlowTokens,
        address[] memory recipients,
        int96[] memory requiredFlowRates,
        string memory name,
        string memory symbol,
        string memory baseURI
    ) external {
        if (
            !(incomingFlowTokens.length > 0 &&
                incomingFlowTokens.length == recipients.length &&
                incomingFlowTokens.length == requiredFlowRates.length)
        ) {
            revert ExistentialNFTCloneFactory_ArgumentLengthMismatch();
        }

        ExistentialNFT clone = ExistentialNFT(implementation.clone());

        emit ExistentialNFTCloneFactory_CloneDeployed(address(clone));

        clone.initialize(
            incomingFlowTokens,
            recipients,
            requiredFlowRates,
            name,
            symbol,
            baseURI
        );
    }

    function updateImplementation(address _implementation) external onlyOwner {
        implementation = _implementation;

        emit ExistentialNFTCloneFactory_ImplementationUpdated(_implementation);
    }
}
