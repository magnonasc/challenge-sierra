const { expect, use } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiBN = require('chai-bn')(web3.utils.BN);

use(chaiAsPromised);
use(chaiBN);

const { toWei, toBN } = web3.utils;

const HurbBikeRent = artifacts.require("HurbBikeRent");

const STATUS_ENUM = {
    IN_PROGRESS: '0',
    DEFAULTED: '1',
    LOSS_OF_RENT: '2',
    COMPLETED: '3'
}

const createDate = () => {
    const currentUnixTime = String(new Date().setMilliseconds(0));
    return toBN(currentUnixTime.substring(0, currentUnixTime.length - 3));
};

contract('HurbBikeRent', (accounts) => {
    it('should create the Bike Rent correctly', async () => {
        const [ _, renterAccount ] = accounts;

        const expected = {
            status: STATUS_ENUM.IN_PROGRESS,
            startingTime: createDate(),
            endingTime: '0',
            agreementEndingTime: createDate().add(toBN('3600')),
            rentValue: toWei('42', 'ether')
        }

        const hurbBikeRentInstance = await HurbBikeRent.new(renterAccount, expected.agreementEndingTime, toWei('42', 'ether'));

        expect(await hurbBikeRentInstance.getStatus()).to.be.a.bignumber.equals(expected.status);
        expect(await hurbBikeRentInstance.getStartingTime()).to.be.a.bignumber.closeTo(expected.startingTime, '1');
        expect(await hurbBikeRentInstance.getAgreementEndingTime()).to.be.a.bignumber.equals(expected.agreementEndingTime);
        expect(await hurbBikeRentInstance.getRentValue()).to.be.a.bignumber.equals(expected.rentValue);
        expect(await hurbBikeRentInstance.getEndingTime()).to.be.a.bignumber.equals(expected.endingTime);
    });

    it('should return the Bike Rent correctly', async () => {
        const [ _, renterAccount ] = accounts;

        const expected = {
            status: STATUS_ENUM.COMPLETED,
            endingTime: {
                before: '0',
                after: createDate()
            }
        }

        const hurbBikeRentInstance = await HurbBikeRent.new(renterAccount, createDate().add(toBN('3600')), toWei('42', 'ether'));

        expect(await hurbBikeRentInstance.getEndingTime()).to.be.a.bignumber.equals(expected.endingTime.before);

        await hurbBikeRentInstance.returnBikeRent();

        expect(await hurbBikeRentInstance.getStatus()).to.be.a.bignumber.equals(expected.status);
        expect(await hurbBikeRentInstance.getEndingTime()).to.be.a.bignumber.closeTo(expected.endingTime.after, '1');
    });

    it('should register loss of rent for the Bike Rent correctly', async () => {
        const [ _, renterAccount ] = accounts;

        const expected = {
            status: STATUS_ENUM.LOSS_OF_RENT,
            endingTime: {
                before: '0',
                after: createDate()
            }
        }

        const hurbBikeRentInstance = await HurbBikeRent.new(renterAccount, createDate().add(toBN('3600')), toWei('42', 'ether'));

        expect(await hurbBikeRentInstance.getEndingTime()).to.be.a.bignumber.equals(expected.endingTime.before);

        await hurbBikeRentInstance.registerLossOfRent();

        expect(await hurbBikeRentInstance.getStatus()).to.be.a.bignumber.equals(expected.status);
        expect(await hurbBikeRentInstance.getEndingTime()).to.be.a.bignumber.closeTo(expected.endingTime.after, '1');
    });
});