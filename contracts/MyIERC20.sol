// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface MyIERC20 {

    function name() external view returns(string memory);

    function symbol() external view returns(string memory);

    function decimals() external view returns(uint);

    function totalTokenSupply() external view returns(uint);

    function balanceOf(address account) external view returns(uint);

    function transfer(address to, uint amount) external;

    function allowance(address owner, address spender) external view returns(uint);

    function approve(address spender, uint amount) external;

    function transferFrom(address from, address to, uint amount) external;

    event Transfer(address from, address to, uint value);

    event Approval(address owner, address spender, uint value);

    event whiteListed(address _whoAddedAddres,address _addedAddress);

    event removedFromWhitelist(address _whoRemovedAddres, address _removedAddress);

}