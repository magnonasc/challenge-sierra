const { expect } = require('chai');

const HurbBikeShareManager = artifacts.require("HurbBikeShareManager");

contract('HurbBikeShareManager', () => {
    it('should set the available Hurb bikes correctly', async () => {
        const hurbBikeShareManagerInstance = await HurbBikeShareManager.deployed();

        let availableHurbBikes;

        availableHurbBikes = await hurbBikeShareManagerInstance.getAvailableHurbBikes.call();
        expect(availableHurbBikes.toNumber()).to.be.equal(0);

        await hurbBikeShareManagerInstance.setAvailableHurbBikes(100);

        availableHurbBikes = await hurbBikeShareManagerInstance.getAvailableHurbBikes.call();
        expect(availableHurbBikes.toString()).to.be.equal('100');
    });
});