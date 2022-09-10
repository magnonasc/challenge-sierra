const { expect, use } = require('chai');
const chaiAsPromised = require('chai-as-promised');

use(chaiAsPromised);

const { toWei, toBN } = web3.utils;
const HRBToken = artifacts.require("HRBToken");
const HRBTokenCrowdsale = artifacts.require("HRBTokenCrowdsale");

const FIRST_MINT = '100000000000';
const HRB_ETH_RATE = '6626070';
const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

contract('HRBTokenCrowdsale', (accounts) => {
    let hrbTokenInstance;
    let hrbTokenCrowdsaleInstance;

    beforeEach(async () => {
        hrbTokenInstance = await HRBToken.new();

        const fundsAccount = accounts[accounts.length - 1];

        hrbTokenCrowdsaleInstance = await HRBTokenCrowdsale.new(HRB_ETH_RATE, fundsAccount, hrbTokenInstance.address);

        await hrbTokenInstance.mint(fundsAccount, toWei(FIRST_MINT, "ether"));

        await hrbTokenInstance.approve(hrbTokenCrowdsaleInstance.address, MAX_UINT256, {from: fundsAccount});
    });

    it('should transfer tokens correctly for the buyer as beneficiary', async () => {
        const [ _, buyerAccount ] = accounts;

        expect((await hrbTokenInstance.balanceOf(buyerAccount)).toString()).to.be.equals('0');

        await hrbTokenCrowdsaleInstance.buyTokens(buyerAccount, {value: toWei('3', 'ether')});

        const tokenRate = await hrbTokenCrowdsaleInstance.getRate();

        expect((await hrbTokenInstance.balanceOf(buyerAccount)).toString()).to.be.equals(toWei(tokenRate.mul(toBN('3')).toString(), 'ether'));
    });

    it('should transfer tokens correctly for a different beneficiary', async () => {
        const [ _, buyerAccount, beneficiaryAccount ] = accounts;

        const tokenRate = await hrbTokenCrowdsaleInstance.getRate();

        expect((await hrbTokenInstance.balanceOf(buyerAccount)).toString()).to.be.equals('0');
        expect((await hrbTokenInstance.balanceOf(beneficiaryAccount)).toString()).to.be.equals('0');

        await hrbTokenCrowdsaleInstance.buyTokens(beneficiaryAccount, {from: buyerAccount, value: toWei('3', 'ether')});

        expect((await hrbTokenInstance.balanceOf(buyerAccount)).toString()).to.be.equals('0');
        expect((await hrbTokenInstance.balanceOf(beneficiaryAccount)).toString()).to.be.equals(toWei(tokenRate.mul(toBN('3')).toString(), 'ether'));
    });
});