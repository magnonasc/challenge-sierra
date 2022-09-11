const { expect, use } = require('chai');
const chaiAsPromised = require('chai-as-promised');

use(chaiAsPromised);

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
    return Number(currentUnixTime.substring(0, currentUnixTime.length - 3));
};

contract('HurbBikeRent', (accounts) => {
    it('should create the Bike Rent correctly', async () => {
        const [ _, renterAccount ] = accounts;

        const expected = {
            status: STATUS_ENUM.IN_PROGRESS,
            startingTime: createDate(),
            endingTime: '0',
            agreementEndingTime: String(createDate() + (60 * 60)),
            rentValue: toWei('42', 'ether')
        }

        const hurbBikeRentInstance = await HurbBikeRent.new(renterAccount, expected.agreementEndingTime, toWei('42', 'ether'));

        expect((await hurbBikeRentInstance.getStatus()).toString()).to.be.equals(expected.status);
        expect((await hurbBikeRentInstance.getStartingTime()).toNumber()).to.be.closeTo(expected.startingTime, 1);
        expect((await hurbBikeRentInstance.getAgreementEndingTime()).toString()).to.be.equals(expected.agreementEndingTime);
        expect((await hurbBikeRentInstance.getRentValue()).toString()).to.be.equals(expected.rentValue);
        expect((await hurbBikeRentInstance.getEndingTime()).toString()).to.be.equals(expected.endingTime);
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

        const hurbBikeRentInstance = await HurbBikeRent.new(renterAccount, String(createDate() + (60 * 60)), toWei('42', 'ether'));

        expect((await hurbBikeRentInstance.getEndingTime()).toString()).to.be.equals(expected.endingTime.before);

        await hurbBikeRentInstance.returnBikeRent();

        expect((await hurbBikeRentInstance.getStatus()).toString()).to.be.equals(expected.status);
        expect((await hurbBikeRentInstance.getEndingTime()).toNumber()).to.be.closeTo(expected.endingTime.after, 1);
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

        const hurbBikeRentInstance = await HurbBikeRent.new(renterAccount, String(createDate() + (60 * 60)), toWei('42', 'ether'));

        expect((await hurbBikeRentInstance.getEndingTime()).toString()).to.be.equals(expected.endingTime.before);

        await hurbBikeRentInstance.registerLossOfRent();

        expect((await hurbBikeRentInstance.getStatus()).toString()).to.be.equals(expected.status);
        expect((await hurbBikeRentInstance.getEndingTime()).toNumber()).to.be.closeTo(expected.endingTime.after, 1);
    });
});