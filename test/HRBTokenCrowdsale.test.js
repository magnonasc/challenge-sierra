const { expect, use } = require('chai');
const chaiAsPromised = require('chai-as-promised');

use(chaiAsPromised);

const { toWei, toBN } = web3.utils;
const HRBToken = artifacts.require("HRBToken");
const HRBTokenCrowdsale = artifacts.require("HRBTokenCrowdsale");

contract('HRBTokenCrowdsale', (accounts) => {
    it('should transfer tokens correctly for the buyer as beneficiary', async () => {
        const [ _, buyerAccount ] = accounts;

        const hrbTokenInstance = await HRBToken.deployed();
        const hrbTokenCrowdsaleInstance = await HRBTokenCrowdsale.deployed();

        expect((await hrbTokenInstance.balanceOf(buyerAccount)).toString()).to.be.equals('0');

        await hrbTokenCrowdsaleInstance.buyTokens(buyerAccount, {value: toWei('3', 'ether')});

        const tokenRate = await hrbTokenCrowdsaleInstance.getRate();

        expect((await hrbTokenInstance.balanceOf(buyerAccount)).toString()).to.be.equals(toWei(tokenRate.mul(toBN('3')).toString(), 'ether'));
    });

    it('should transfer tokens correctly for a different beneficiary', async () => {
        const [ _, buyerAccount, beneficiaryAccount ] = accounts;

        const hrbTokenInstance = await HRBToken.deployed();
        const hrbTokenCrowdsaleInstance = await HRBTokenCrowdsale.deployed();

        const tokenRate = await hrbTokenCrowdsaleInstance.getRate();

        expect((await hrbTokenInstance.balanceOf(buyerAccount)).toString()).to.be.equals(toWei(tokenRate.mul(toBN('3')).toString(), 'ether'));
        expect((await hrbTokenInstance.balanceOf(beneficiaryAccount)).toString()).to.be.equals('0');

        await hrbTokenCrowdsaleInstance.buyTokens(beneficiaryAccount, {from: buyerAccount, value: toWei('3', 'ether')});

        expect((await hrbTokenInstance.balanceOf(buyerAccount)).toString()).to.be.equals(toWei(tokenRate.mul(toBN('3')).toString(), 'ether'));
        expect((await hrbTokenInstance.balanceOf(beneficiaryAccount)).toString()).to.be.equals(toWei(tokenRate.mul(toBN('3')).toString(), 'ether'));
    });
});