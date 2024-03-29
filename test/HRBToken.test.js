const { expect, use } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiBN = require('chai-bn')(web3.utils.BN);

use(chaiAsPromised);
use(chaiBN);

const HRBToken = artifacts.require("HRBToken");

contract('HRBToken', (accounts) => {
    let hrbTokenInstance;

    beforeEach(async () => {
        hrbTokenInstance = await HRBToken.new();
    });

    it('should revert when non minter tries to mint tokens', async () => {
        const [ _, nonMinterAccount ] = accounts;

        const expected = {
            nonMinterAccount: {
                before: '0',
                after: '0'
            }
        }

        expect(await hrbTokenInstance.balanceOf(nonMinterAccount)).to.be.a.bignumber.equals(expected.nonMinterAccount.before);

        return expect(hrbTokenInstance.mint(nonMinterAccount, '1', {from: nonMinterAccount})).to.eventually.be.rejected;
    });

    it('should mint tokens correctly', async () => {
        const [ deployerAccount, recipientAccount ] = accounts;

        const expected = {
            recipientAccount: {
                before: '0',
                after: '1'
            }
        }

        expect(await hrbTokenInstance.balanceOf(recipientAccount)).to.be.a.bignumber.equals(expected.recipientAccount.before);

        await hrbTokenInstance.mint(recipientAccount, '1', {from: deployerAccount});

        expect(await hrbTokenInstance.balanceOf(recipientAccount)).to.be.a.bignumber.equals(expected.recipientAccount.after);
    });
});