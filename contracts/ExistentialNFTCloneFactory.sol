// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {ExistentialNFT} from "./ExistentialNFT.sol";

error ExistentialNFTCloneFactory_ArgumentLengthMismatch();

contract ExistentialNFTCloneFactory {
    using Clones for address;

    address public immutable implementation;
    address[] private clones;

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function deployClone(
        ISuperToken[] memory incomingFlowTokens,
        address[] memory recipients,
        int96[] memory requiredFlowRates,
        string memory name,
        string memory symbol,
        string memory tokenURI
    ) external {
        if (
            !(incomingFlowTokens.length > 0 &&
                incomingFlowTokens.length == recipients.length &&
                incomingFlowTokens.length == requiredFlowRates.length)
        ) {
            revert ExistentialNFTCloneFactory_ArgumentLengthMismatch();
        }

        ExistentialNFT clone = ExistentialNFT(implementation.clone());

        clones.push(address(clone));

        clone.initialize(
            incomingFlowTokens,
            recipients,
            requiredFlowRates,
            name,
            symbol,
            tokenURI
        );
    }

    function getClones() external view returns (address[] memory) {
        return clones;
    }
}
