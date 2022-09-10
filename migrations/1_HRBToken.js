const HRBToken = artifacts.require("HRBToken");

module.exports = function (deployer) {
  deployer.deploy(HRBToken);
};
