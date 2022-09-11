//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HurbBikeRent
 * @dev HurbBikeRent is a smart contract for handling bike rentals for Hurb.
 * Even though anyone can create an instance of it, only the ones owned by
 * the official HurbBikeShareManager contract should be considered valid.
 */
contract HurbBikeRent is Ownable {
    enum Status{ IN_PROGRESS, DEFAULTED, LOSS_OF_RENT, COMPLETED }

    address private renter;
    Status private status;

    uint private startingTime;
    uint private endingTime;

    // The ending time defined on the rent agreement, this is store to be able to measure rent defaults.
    uint private agreementEndingTime;

    // The amount of tokens paid for the rent.
    uint private rentValue;

    constructor(address _renter, uint _agreementEndingTime, uint _rentValue) {
        renter = _renter;
        status = Status.IN_PROGRESS;
        startingTime = block.timestamp;
        agreementEndingTime = _agreementEndingTime;
        rentValue = _rentValue;
    }

    modifier inProgress() {
        require(status == Status.IN_PROGRESS, "HurbBikeRent: The rent is not in progress.");
        _;
    }

    function getRenter() public view returns(address) {
        return renter;
    }

    function getStatus() public view returns(uint8) {
        if (status == Status.IN_PROGRESS && block.timestamp > agreementEndingTime) {
            return uint8(Status.DEFAULTED);
        }

        return uint8(status);
    }

    function getStartingTime() public view returns(uint) {
        return startingTime;
    }

    function getEndingTime() public view returns(uint) {
        return endingTime;
    }

    function getAgreementEndingTime() public view returns(uint) {
        return agreementEndingTime;
    }

    function getRentValue() public view returns(uint) {
        return rentValue;
    }

    function returnBikeRent() public inProgress onlyOwner {
        status = Status.COMPLETED;
        endingTime = block.timestamp;
    }

    function registerLossOfRent() public inProgress onlyOwner {
        status = Status.LOSS_OF_RENT;
        endingTime = block.timestamp;
    }

    function renounceOwnership() public view override onlyOwner {
        revert("HurbBikeRent: Cannot renounce ownership.");
    }

    function transferOwnership(address) public view override onlyOwner {
        revert("HurbBikeRent: Cannot transfer ownership.");
    }
}
