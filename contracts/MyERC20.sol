// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyIERC20.sol";

contract MyERC20 is MyIERC20{

    address public owner;
    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public _allowances;
    string public _name;
    string public _symbol;
    uint public _totalTokenSupply;
    mapping(address => bool) whitelistedAddresses;


    constructor(string memory name_, string memory symbol_){
        owner = msg.sender;
        _name = name_;
        _symbol = symbol_;
        _totalTokenSupply = 0;
    }


    //////////// WHITELIST //////////////////

    // "must be whitelisted" modifier 
    modifier isWhitelisted(address _address) {
        require(whitelistedAddresses[_address], "You need to be whitelisted");
        _;
    }

    // adding addresses to the whitelist 
    function addAddressesToWhitelist(address _addressToWhitelist) public isWhitelisted(msg.sender){
        whitelistedAddresses[_addressToWhitelist] = true;
        emit whiteListed(msg.sender, _addressToWhitelist);
    }

    function deleteAddressesFromWhitelist(address _addressToWhitelist) public isWhitelisted(msg.sender){
        whitelistedAddresses[_addressToWhitelist] = false;
        emit removedFromWhitelist(msg.sender, _addressToWhitelist);
    }

    // verifying the whiteList users
    function verifyAddressesFromWhitelist(address _whitelistedAddresses) public view returns(bool){
        bool userIsWhitelisted = whitelistedAddresses[_whitelistedAddresses];
        return userIsWhitelisted;
    }


    ///////////////////////////////////////

    function _mint(address _tokenShopAddress, uint _tokensToMint) public zeroAddress(_tokenShopAddress) isWhitelisted(msg.sender){
        _totalTokenSupply += _tokensToMint;
        balances[_tokenShopAddress] += _tokensToMint;
        emit Transfer(address(0), _tokenShopAddress, _tokensToMint);
    }

    function _burn(address _tokenShopAddress, uint _tokensToBurn) public zeroAddress(_tokenShopAddress) isWhitelisted(msg.sender){
        _totalTokenSupply -= _tokensToBurn;
        balances[_tokenShopAddress] -= _tokensToBurn;
        emit Transfer(_tokenShopAddress, address(0), _tokensToBurn);
    }


    function name() external view returns(string memory){
        return _name;
    }

    function symbol() external view returns(string memory){
        return _symbol;
    }

    function decimals() external pure returns(uint){
        return 18;
    }

    function totalTokenSupply() public view returns(uint){
        return _totalTokenSupply;
    }

    function ownerAddress() public view returns(address){
        return owner;
    }

    function balanceOf(address _account) external view override returns(uint){
        return balances[_account];
    }

    modifier balanceEnough(address _account, uint _amount){
        require(balances[_account] >= _amount, "Not enough balance (ERC20)");
        _;
    }
    

    modifier onlyOwner(){
        require(owner == msg.sender, "Invalid owner (ERC20)");
        _;
    }

    modifier zeroAddress(address _account){
        require(_account != address(0), "This is zero address (ERC20)");
        _;
    }

    function transfer(address _to, uint _amount) public onlyOwner zeroAddress(_to) balanceEnough(msg.sender, _amount) override{
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);

    }

    function allowance(address _owner, address _spender) public view override returns(uint){
        return _allowances[_owner][_spender];
    }

    function approve(address _spender, uint _amount) public override{
        _approve(msg.sender, _spender, _amount);
    }

    function _approve(address _owner, address _spender, uint _amount) private onlyOwner zeroAddress(_owner) zeroAddress(_spender){
        _allowances[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }

    function transferFrom(address _from, address _to, uint _amount) external override zeroAddress(_from) zeroAddress(_to) balanceEnough(_from, _amount){
        _allowances[_from][_to] += _amount;
        balances[_from] -= _amount;
        balances[_to] += _amount;
        emit Transfer(_from, _to, _amount);
    }
}
