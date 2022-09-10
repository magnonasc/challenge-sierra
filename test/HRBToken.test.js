const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const HRBToken = artifacts.require("HRBToken");

contract('HRBToken', (accounts) => {
  it('should revert when non minter tries to mint tokens', async () => {
    const deployerAccount = accounts[0];

    const hrbTokenInstance = await HRBToken.deployed({from: deployerAccount});

    const nonMinterAccount = accounts[1];

    expect((await hrbTokenInstance.balanceOf(nonMinterAccount)).toString()).to.be.equals('0');

    expect(hrbTokenInstance.mint(nonMinterAccount, 1, {from: nonMinterAccount})).to.eventually.be.rejected;

    expect((await hrbTokenInstance.balanceOf(nonMinterAccount)).toString()).to.be.equals('0');
  });

  it('should mint tokens correctly', async () => {
    const deployerAccount = accounts[0];

    const hrbTokenInstance = await HRBToken.deployed({from: deployerAccount});

    const recipientAccount = accounts[1];

    expect((await hrbTokenInstance.balanceOf(recipientAccount)).toString()).to.be.equals('0');

    await hrbTokenInstance.mint(recipientAccount, 1, {from: deployerAccount});

    expect((await hrbTokenInstance.balanceOf(recipientAccount)).toString()).to.be.equals('1');
  });
});