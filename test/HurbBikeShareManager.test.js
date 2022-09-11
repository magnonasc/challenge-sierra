const { expect, use } = require('chai');
const chaiAsPromised = require('chai-as-promised');

use(chaiAsPromised);

const { MAX_UINT256, ZERO_ADDRESS } = require('../utils/constants');
const { toWei, toBN } = web3.utils;

const HRBToken = artifacts.require("HRBToken");
const HurbBikeShareManager = artifacts.require("HurbBikeShareManager");

contract('HurbBikeShareManager', (accounts) => {
    let hrbTokenInstance;
    let hurbBikeShareManagerInstance;

    const mintHRBTokensFor = async (account, amountInWei) => {
        await hrbTokenInstance.mint(account, amountInWei);
    }

    beforeEach(async () => {
        hrbTokenInstance = await HRBToken.new();

        const walletAccount = accounts[accounts.length - 1];

        hurbBikeShareManagerInstance = await HurbBikeShareManager.new(hrbTokenInstance.address, walletAccount);

        await hurbBikeShareManagerInstance.setTokensPerHour(toWei('42', 'ether'));
        await hurbBikeShareManagerInstance.setAvailableHurbBikes('100');

        await hrbTokenInstance.approve(hurbBikeShareManagerInstance.address, MAX_UINT256, {from: walletAccount});
    });

    it('should set the available Hurb Bikes correctly', async () => {
        const expected = {
            availableHurbBikes: {
                before: '100',
                after: '50'
            }
        }

        expect((await hurbBikeShareManagerInstance.getAvailableHurbBikes()).toString()).to.be.equals(expected.availableHurbBikes.before);

        await hurbBikeShareManagerInstance.setAvailableHurbBikes('50');

        expect((await hurbBikeShareManagerInstance.getAvailableHurbBikes()).toString()).to.be.equals(expected.availableHurbBikes.after);
    });

    it('should set the token per hours correctly', async () => {
        const expected = {
            tokensPerHour: {
                before: toWei('42', 'ether'),
                after: toWei('21', 'ether')
            }
        }

        expect((await hurbBikeShareManagerInstance.getTokensPerHour()).toString()).to.be.equals(expected.tokensPerHour.before);

        await hurbBikeShareManagerInstance.setTokensPerHour(toWei('21', 'ether'));

        expect((await hurbBikeShareManagerInstance.getTokensPerHour()).toString()).to.be.equals(expected.tokensPerHour.after);
    });

    it('should not rent the Hurb Bikes if there is allowance for the HRB tokens', async () => {
        return expect(hurbBikeShareManagerInstance.rentBike('3')).to.eventually.be.rejected;
    });

    it('should not rent the Hurb Bikes if there is HRB tokens balance for the renter', async () => {
        const [ _, renterAccount ] = accounts;

        await hrbTokenInstance.approve(hurbBikeShareManagerInstance.address, MAX_UINT256, {from: renterAccount});

        expect((await hrbTokenInstance.balanceOf(renterAccount)).toString()).to.be.equals('0');

        return expect(hurbBikeShareManagerInstance.rentBike('3')).to.eventually.be.rejected;
    });

    it('should rent the Hurb Bike correctly', async () => {
        const [ _, renterAccount ] = accounts;
        const walletAccount = accounts[accounts.length - 1];

        const expected = {
            renterAccount: {
                before: toWei('504', 'ether'),
                after: '0'
            },
            walletAccount: {
                before: '0',
                after: toWei('504', 'ether')
            }
        }

        await hrbTokenInstance.mint(renterAccount, toWei('504', 'ether'));
        await hrbTokenInstance.approve(hurbBikeShareManagerInstance.address, MAX_UINT256, {from: renterAccount});

        expect((await hrbTokenInstance.balanceOf(renterAccount)).toString()).to.be.equals(expected.renterAccount.before);
        expect((await hrbTokenInstance.balanceOf(walletAccount)).toString()).to.be.equals(expected.walletAccount.before);

        await hurbBikeShareManagerInstance.rentBike('3', {from: renterAccount});

        expect((await hrbTokenInstance.balanceOf(renterAccount)).toString()).to.be.equals(expected.renterAccount.after);
        expect((await hrbTokenInstance.balanceOf(walletAccount)).toString()).to.be.equals(expected.walletAccount.after);
    });

    it('should not return the Hurb Bike if there is no rent currently in progress', async () => {
        const [ _, renterAccount ] = accounts;

        return expect(hurbBikeShareManagerInstance.returnBike({from: renterAccount})).to.eventually.be.rejected;
    });

    it('should return the Hurb Bike correctly', async () => {
        const [ _, renterAccount ] = accounts;
        const walletAccount = accounts[accounts.length - 1];

        const expected = {
            renterAccount: {
                before: '0',
                after:  toWei('378', 'ether')
            },
            walletAccount: {
                before: toWei('504', 'ether'),
                after: toWei('126', 'ether')
            }
        }

        await hrbTokenInstance.mint(renterAccount, toWei('504', 'ether'));
        await hrbTokenInstance.approve(hurbBikeShareManagerInstance.address, MAX_UINT256, {from: renterAccount});

        await hurbBikeShareManagerInstance.rentBike('3', {from: renterAccount});

        expect((await hrbTokenInstance.balanceOf(renterAccount)).toString()).to.be.equals(expected.renterAccount.before);
        expect((await hrbTokenInstance.balanceOf(walletAccount)).toString()).to.be.equals(expected.walletAccount.before);

        await hurbBikeShareManagerInstance.returnBike({from: renterAccount});

        expect((await hrbTokenInstance.balanceOf(renterAccount)).toString()).to.be.equals(expected.renterAccount.after);
        expect((await hrbTokenInstance.balanceOf(walletAccount)).toString()).to.be.equals(expected.walletAccount.after);
    });

    it('should return the zero address if there is no rent currently in progress', async () => {
        const [ _, renterAccount ] = accounts;

        expect((await hurbBikeShareManagerInstance.getHurbBikeRental({from: renterAccount}))).to.be.equals(ZERO_ADDRESS);
    });

    it('should return the Hurb Bike rental correctly', async () => {
        const [ _, renterAccount ] = accounts;

        await hrbTokenInstance.mint(renterAccount, toWei('504', 'ether'));
        await hrbTokenInstance.approve(hurbBikeShareManagerInstance.address, MAX_UINT256, {from: renterAccount});

        await hurbBikeShareManagerInstance.rentBike('3', {from: renterAccount});

        expect((await hurbBikeShareManagerInstance.getHurbBikeRental({from: renterAccount}))).to.be.not.equals(ZERO_ADDRESS);
    });

    it('should register lost of rent correctly', async () => {
        const [ _, renterAccount ] = accounts;

        const expected = {
            renterAccount: {
                before: '0',
                after: '0'
            }
        }

        await hrbTokenInstance.mint(renterAccount, toWei('504', 'ether'));
        await hrbTokenInstance.approve(hurbBikeShareManagerInstance.address, MAX_UINT256, {from: renterAccount});
        await hurbBikeShareManagerInstance.rentBike('3', {from: renterAccount});

        expect((await hrbTokenInstance.balanceOf(renterAccount)).toString()).to.be.equals(expected.renterAccount.before);

        await hurbBikeShareManagerInstance.registerLossOfRent({from: renterAccount});

        expect((await hrbTokenInstance.balanceOf(renterAccount)).toString()).to.be.equals(expected.renterAccount.after);
    });

    it('should not renounce ownership', async () => {
        return expect(hurbBikeShareManagerInstance.renounceOwnership()).to.eventually.be.rejected;
    });

    it('should not transfer ownership', async () => {
        return expect(hurbBikeShareManagerInstance.transferOwnership(accounts[1])).to.eventually.be.rejected;
    });
});