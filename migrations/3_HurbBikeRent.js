const { ZERO_ADDRESS } = require('../utils/constants');

const HurbBikeRent = artifacts.require("HurbBikeRent");

module.exports = function (deployer) {
  deployer.deploy(HurbBikeRent, ZERO_ADDRESS, 0);
};
