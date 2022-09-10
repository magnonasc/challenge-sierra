//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract HurbBikeRent is Ownable {
    enum Status{ IN_PROGRESS, DEFAULTED, LOSS_OF_RENT, COMPLETED }

    address private renter;
    Status private status;
    uint private startingTime;
    uint private agreementEndingTime;
    uint private endingTime;

    constructor(address _renter, uint _agreementEndingTime) {
        renter = _renter;
        status = Status.IN_PROGRESS;
        startingTime = block.timestamp;
        agreementEndingTime = _agreementEndingTime;
    }

    modifier inProgress() {
        require(status == Status.IN_PROGRESS, "HurbBikeRent: The rent is not in progress.");
        _;
    }

    function getRenter() public view returns(address) {
        return renter;
    }

    function getStatus() public view returns(Status) {
        if (status == Status.IN_PROGRESS && block.timestamp > agreementEndingTime) {
            return Status.DEFAULTED;
        }

        return status;
    }

    function getStartingTime() public view returns(uint) {
        return startingTime;
    }

    function getAgreementEndingTime() public view returns(uint) {
        return agreementEndingTime;
    }

    function getEndingTime() public view returns(uint) {
        return endingTime;
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
