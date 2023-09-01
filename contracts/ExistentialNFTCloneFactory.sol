// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {ExistentialNFT} from "./ExistentialNFT.sol";

error ExistentialNFTCloneFactory_ArgumentLengthMismatch();

contract ExistentialNFTCloneFactory {
    using Clones for address;

    address public immutable implementation;

    event ExistentialNFT_CloneDeployed(address indexed clone);

    constructor(address _implementation) {
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

        emit ExistentialNFT_CloneDeployed(address(clone));

        clone.initialize(
            incomingFlowTokens,
            recipients,
            requiredFlowRates,
            name,
            symbol,
            baseURI
        );
    }
}
