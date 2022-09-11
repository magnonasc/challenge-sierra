//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./HurbBikeRent.sol";

contract HurbBikeShareManager is Ownable {
    mapping(address => HurbBikeRent) private hurbBikeRentals;
    uint private availableHurbBikes;

    IERC20 private hurbToken;
    address private hurbWallet;
    uint private tokensPerHour;

    event BikeRentalStarted(address indexed rent, address indexed renter, uint startingTime, uint endingTime);
    event BikeRentalCompleted(address indexed rent, address indexed renter, uint agreementEndingTime, uint endingTime);
    event LossOfRent(address indexed rent, address indexed renter, uint lossOfRentTime);

    modifier available() {
        require(availableHurbBikes > 0, "HurbBikeShareManager: There is no available Hurb bikes to be rented.");
        _;
    }

    modifier allowed() {
        // The call for getStatus() is repeated in the condition below to make use of the short-circuiting.
        require(address(hurbBikeRentals[msg.sender]) == address(0) || hurbBikeRentals[msg.sender].getStatus() == HurbBikeRent.Status.COMPLETED || hurbBikeRentals[msg.sender].getStatus() == HurbBikeRent.Status.LOSS_OF_RENT, "HurbBikeShareManager: There is an ongoing rent already associated with the caller's address.");
        _;
    }

    modifier inProgress() {
        // The call for getStatus() is repeated in the condition below to make use of the short-circuiting.
        require(address(hurbBikeRentals[msg.sender]) != address(0) && (hurbBikeRentals[msg.sender].getStatus() == HurbBikeRent.Status.IN_PROGRESS || hurbBikeRentals[msg.sender].getStatus() == HurbBikeRent.Status.DEFAULTED), "HurbBikeShareManager: There is no rent associated with the caller's address.");
        _;
    }

    constructor(IERC20 _hurbToken, address _hurbWallet) {
        hurbToken = _hurbToken;
        hurbWallet = _hurbWallet;
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

    function getTokensPerHour() external view returns(uint) {
        return tokensPerHour;
    }

    function setTokensPerHour(uint _tokensPerHour) external onlyOwner {
        tokensPerHour = _tokensPerHour;
    }

    function rentBike(uint _rentHours) external payable available allowed {
        uint endingTime = block.timestamp + (_rentHours * 1 hours);
        uint rentValue = tokensPerHour * _rentHours;

        hurbBikeRentals[msg.sender] = new HurbBikeRent(msg.sender, endingTime, rentValue);
        availableHurbBikes--;

        hurbToken.transferFrom(msg.sender, hurbWallet, rentValue * 4);

        emit BikeRentalStarted(address(hurbBikeRentals[msg.sender]), msg.sender, block.timestamp, endingTime);
    }

    function returnBike() external inProgress {
        hurbBikeRentals[msg.sender].returnBikeRent();

        uint agreementEndingTime = hurbBikeRentals[msg.sender].getAgreementEndingTime();

        if (agreementEndingTime >= block.timestamp) {
            hurbToken.transferFrom(hurbWallet, msg.sender, hurbBikeRentals[msg.sender].getRentValue() * 3);
        }

        emit BikeRentalCompleted(address(hurbBikeRentals[msg.sender]), msg.sender, agreementEndingTime, block.timestamp);
    }

    function registerLossOfRent() external inProgress {
        hurbBikeRentals[msg.sender].registerLossOfRent();

        emit LossOfRent(address(hurbBikeRentals[msg.sender]), msg.sender, block.timestamp);
    }

    function renounceOwnership() public view override onlyOwner {
        revert("HurbBikeShareManager: Cannot renounce ownership.");
    }

    function transferOwnership(address) public view override onlyOwner {
        revert("HurbBikeShareManager: Cannot transfer ownership.");
    }
}
