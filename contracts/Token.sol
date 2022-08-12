// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./MyERC20.sol";

contract Token is MyERC20 {
    constructor(uint initialSupply) MyERC20("Intern", "INT") {
        whitelistedAddresses[owner] = true;
        _mint(msg.sender, initialSupply);
    }
}


