//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HRBToken is ERC20 {
    address private minter;

    constructor() ERC20("Hurb Token", "HRB") {
        minter = msg.sender;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "HRBToken: Caller is not the minter");
        _;
    }

    function mint(address _account, uint256 _amount) external onlyMinter {
        _mint(_account, _amount);
    }
}
