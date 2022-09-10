//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./HurbBikeRent.sol";

contract HurbBikeShareManager is Ownable {
    mapping(address => HurbBikeRent) private hurbBikeRentals;
    uint private availableHurbBikes;

    event BikeRentalStarted(address indexed rent, address indexed renter, uint startingTime, uint endingTime);
    event BikeRentalCompleted(address indexed rent, address indexed renter, uint agreementEndingTime, uint endingTime);
    event LossOfRent(address indexed rent, address indexed renter, uint lossOfRentTime);

    modifier available() {
        require(availableHurbBikes > 0, "There is no available Hurb bikes to be rented.");
        _;
    }
    
    modifier allowed() {
        require(address(hurbBikeRentals[msg.sender]) == address(0) || hurbBikeRentals[msg.sender].getStatus() == HurbBikeRent.Status.COMPLETED || hurbBikeRentals[msg.sender].getStatus() == HurbBikeRent.Status.LOSS_OF_RENT, "There is an ongoing rent already associated with the caller's address.");
        _;
    }

    modifier inProgress() {
        require(address(hurbBikeRentals[msg.sender]) != address(0) && (hurbBikeRentals[msg.sender].getStatus() == HurbBikeRent.Status.IN_PROGRESS || hurbBikeRentals[msg.sender].getStatus() == HurbBikeRent.Status.DEFAULTED), "There is no rent associated with the caller's address.");
        _;
    }

    function getHurbBikeRental() public view returns(address) {
        return address(hurbBikeRentals[msg.sender]);
    }

    function getAvailableHurbBikes() public view returns(uint) {
        return availableHurbBikes;
    }

    function setAvailableHurbBikes(uint _availableHurbBikes) external onlyOwner {
        availableHurbBikes = _availableHurbBikes;
    }

    function rentBike(uint _rentTime) external payable available allowed {
        uint endingTime = block.timestamp + _rentTime;
        hurbBikeRentals[msg.sender] = new HurbBikeRent(msg.sender, endingTime);
        availableHurbBikes--;

        // TODO token management

        emit BikeRentalStarted(address(hurbBikeRentals[msg.sender]), msg.sender, block.timestamp, endingTime);
    }

    function returnBike() external inProgress {
        hurbBikeRentals[msg.sender].returnBikeRent();

        uint agreementEndingTime = hurbBikeRentals[msg.sender].getAgreementEndingTime();

        if (agreementEndingTime >= block.timestamp) {
            // TODO token management
        }

        emit BikeRentalCompleted(address(hurbBikeRentals[msg.sender]), msg.sender, agreementEndingTime, block.timestamp);
    }

    function registerLossOfRent() external inProgress {
        hurbBikeRentals[msg.sender].registerLossOfRent();
        emit LossOfRent(address(hurbBikeRentals[msg.sender]), msg.sender, block.timestamp);
    }

    function renounceOwnership() public view override onlyOwner {
        revert("Cannot renounce ownership.");
    }

    function transferOwnership(address) public view override onlyOwner {
        revert("Cannot transfer ownership.");
    }
}
