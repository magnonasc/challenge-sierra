const { expect, use } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiBN = require('chai-bn')(web3.utils.BN);

const { MAX_UINT256 } = require('../utils/constants');
const { toWei, toBN } = web3.utils;

use(chaiAsPromised);
use(chaiBN);

const HRBToken = artifacts.require("HRBToken");
const HRBTokenCrowdsale = artifacts.require("HRBTokenCrowdsale");

const FIRST_MINT = '100000000000';
const HRB_ETH_RATE = '6626070';

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
        const fundsAccount = accounts[accounts.length - 1];

        const tokenRate = await hrbTokenCrowdsaleInstance.getRate();

        const expected = {
            fundsAccount: {
                before: toWei(FIRST_MINT, 'ether'),
                after: toBN(toWei(FIRST_MINT, 'ether')).sub(toBN(toWei('3', 'ether')).mul(tokenRate))
            },
            buyerAccount: {
                before: '0',
                after: toWei(tokenRate.mul(toBN('3')).toString(), 'ether')
            }
        }

        expect(await hrbTokenInstance.balanceOf(fundsAccount)).to.be.a.bignumber.equals(expected.fundsAccount.before);
        expect(await hrbTokenInstance.balanceOf(buyerAccount)).to.be.a.bignumber.equals(expected.buyerAccount.before);

        await hrbTokenCrowdsaleInstance.buyTokens(buyerAccount, {value: toWei('3', 'ether')});

        expect(await hrbTokenInstance.balanceOf(fundsAccount)).to.be.a.bignumber.equals(expected.fundsAccount.after);
        expect(await hrbTokenInstance.balanceOf(buyerAccount)).to.be.a.bignumber.equals(expected.buyerAccount.after);
    });

    it('should transfer tokens correctly for a different beneficiary', async () => {
        const [ _, buyerAccount, beneficiaryAccount ] = accounts;
        const fundsAccount = accounts[accounts.length - 1];

        const tokenRate = await hrbTokenCrowdsaleInstance.getRate();

        const expected = {
            fundsAccount: {
                before: toWei(FIRST_MINT, 'ether'),
                after: toBN(toWei(FIRST_MINT, 'ether')).sub(toBN(toWei('3', 'ether')).mul(tokenRate))
            },
            buyerAccount: {
                before: '0',
                after: '0'
            },
            beneficiaryAccount: {
                before: '0',
                after: toWei(tokenRate.mul(toBN('3')).toString(), 'ether')
            }
        }

        expect(await hrbTokenInstance.balanceOf(fundsAccount)).to.be.a.bignumber.equals(expected.fundsAccount.before);
        expect(await hrbTokenInstance.balanceOf(buyerAccount)).to.be.a.bignumber.equals(expected.buyerAccount.before);
        expect(await hrbTokenInstance.balanceOf(beneficiaryAccount)).to.be.a.bignumber.equals(expected.beneficiaryAccount.before);

        await hrbTokenCrowdsaleInstance.buyTokens(beneficiaryAccount, {from: buyerAccount, value: toWei('3', 'ether')});

        expect(await hrbTokenInstance.balanceOf(fundsAccount)).to.be.a.bignumber.equals(expected.fundsAccount.after);
        expect(await hrbTokenInstance.balanceOf(buyerAccount)).to.be.a.bignumber.equals(expected.buyerAccount.after);
        expect(await hrbTokenInstance.balanceOf(beneficiaryAccount)).to.be.a.bignumber.equals(expected.beneficiaryAccount.after);
    });
});