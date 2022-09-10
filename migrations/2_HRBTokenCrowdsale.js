const HRBTokenCrowdsale = artifacts.require("HRBTokenCrowdsale");
const HRBToken = artifacts.require("HRBToken");

const { toWei } = web3.utils;

const FIRST_MINT = process.env.HRB_TOKEN_FIRST_MINT || '100000000000';
const HRB_ETH_RATE = process.env.HRB_ETH_RATE || '6626070';
const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

module.exports = async function (deployer, _, accounts) {
    const hrbTokenInstance = await HRBToken.deployed();

    const fundsAccount = accounts[accounts.length - 1];

    await deployer.deploy(HRBTokenCrowdsale, HRB_ETH_RATE, fundsAccount, hrbTokenInstance.address);

    const hrbTokenCrowdsaleInstance = await HRBTokenCrowdsale.deployed();

    await hrbTokenInstance.mint(fundsAccount, toWei(FIRST_MINT, "ether"));

    await hrbTokenInstance.approve(hrbTokenCrowdsaleInstance.address, MAX_UINT256, {from: fundsAccount});
};
