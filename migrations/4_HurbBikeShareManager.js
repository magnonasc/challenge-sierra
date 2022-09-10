const HurbBikeShareManager = artifacts.require("HurbBikeShareManager");
const HRBToken = artifacts.require("HRBToken");

const { toWei } = web3.utils;

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

module.exports = async function (deployer, _, accounts) {
    const hurbWalletAccount = accounts[accounts.length - 2];

    const hrbTokenInstance = await HRBToken.deployed();

    await deployer.deploy(HurbBikeShareManager, hrbTokenInstance.address, hurbWalletAccount);

    const hurbBikeShareManagerInstance = await HurbBikeShareManager.deployed();

    await hurbBikeShareManagerInstance.setTokensPerHour(toWei('48', 'ether'));

    await hrbTokenInstance.approve(hurbBikeShareManagerInstance.address, MAX_UINT256, {from: hurbWalletAccount});
};
