const HurbBikeRent = artifacts.require("HurbBikeRent");

module.exports = function (deployer) {
  deployer.deploy(HurbBikeRent, '0x0000000000000000000000000000000000000000', 0);
};
