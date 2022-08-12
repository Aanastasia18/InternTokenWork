import React, { useState, useEffect} from 'react';
import './App.css';
import {ethers} from 'ethers';
import Token from "./contracts/Token.json";
import TokenAddress from "./contracts/Token-contract-address.json";
import Swal from 'sweetalert2';


function App() {

  const contractAddress = TokenAddress.Token;

  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [symbol, setTokenSymbol] = useState('');
  const [owner, setOwner] = useState(null);
  const [balance, setTokenBalance] = useState(0);
  const [whitelistedAcc, setWhitelistedAcc] = useState(false);
  const [accInQueueToWL, setAccInQueueToWL] = useState();
  const [delFromWL, setDelFromWL] = useState();
  const [burnAcc, setBurnAcc] = useState();
  const [mintAcc, setMintAcc] = useState();
  const [amount, setAmount] = useState();
  const [toAccount, setToAccount] = useState();



  const connection = async () => {
      if(window.ethereum){
        window.ethereum.request({method:'eth_requestAccounts'})
        .then(res=>{
        // Return the address of the wallet
          newAccountConection(res);
          console.log(res) 
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Your account has been connected!',
            showConfirmButton: false,
            timer: 1500
          })
        })
      }else{
        Swal.fire('Any fool can use a computer');
      }
    }

  ///////////// account connection function ///////////////
  const newAccountConection = async (newAcc) => {
    setAccount(newAcc);
    ethUpdate();
  }

  ///////// Get: provider, signer and contract //////////
    /////////// Provider, Signer, Contract //////////////
    function PSC(){
      let tProvider = new ethers.providers.Web3Provider(window.ethereum);
      let tSigner =  tProvider.getSigner();
      let tContract = new ethers.Contract(contractAddress, Token.abi, tSigner);

      return [tProvider, tSigner, tContract];

  }

  /////// update ethAccount //////////////
  /// t - temporal
  const ethUpdate = function(){

      let [tprovider, tsigner, tcontract] = PSC();
      setProvider(tprovider);
      setSigner(tsigner);
      setContract(tcontract); 
  }


  const getBalance = async function(){
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts'});
    const Contract = new ethers.Contract(contractAddress, Token.abi, provider);
  
    const tBalance = Contract.balanceOf(account);
    
    let decimals = await Contract.decimals();
    let tokBalance = await tBalance / (10 ** decimals);
    console.log(tokBalance);
    setTokenBalance(tokBalance);
    setAccount(account);
}

  const chainChangedHandler = () => {
		// reload the page to avoid any errors with chain change mid use of application
		window.location.reload();
	}

	// listen for account changes
	window.ethereum.on('accountsChanged', newAccountConection);
	window.ethereum.on('chainChanged', chainChangedHandler);
	window.ethereum.on('balanceChanged', getBalance);

  useEffect(() => {
    if (contract != null) {
      getBalance();
      getTokenName();
      getTokenSymbol();
  }
  }, [contract]);

  // Работает
  const getTokenName = async () =>{
    let tn = await contract.name();
    console.log("Token name: ", tn);
    setTokenName(tn);
  }

  const getOwnerAddress = async () =>{
    let own = await contract.owner();
    console.log("Owner name: ", own);
    setOwner(own);
  }

  const getTokenSymbol = async () =>{
    let symb = await contract.symbol();
    console.log("Token symbol: ", symb);
    setTokenSymbol(symb);
  }
  ////////////////// Functions /////////////////////////
  // is whitelisted check
  const WLCheck = async function(){
    const [provider, , ] = PSC();
    const Contract = new ethers.Contract(contractAddress, Token.abi, provider);

    const res = await Contract.verifyAddressesFromWhitelist(whitelistedAcc);
    console.log(res);
    if(res){
      console.log("Account is from Whitelist");
      setWhitelistedAcc(true);
    }else{
      setWhitelistedAcc(false);
      console.log("You're not whitelisted!\n It means that you cannot burn and mint tokens. You can't also add people to the WhiteList");
    }
  }

  const addAddressesToTheWhitelist = async function(){
    getOwnerAddress();
    if(accInQueueToWL != owner){
      const [, signer, contract] = PSC();
      WLCheck(signer);
      if({whitelistedAcc}){
        await contract.addAddressesToWhitelist(accInQueueToWL);
        // await access.wait();
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: `Account ${accInQueueToWL} was successfully added to the WhiteList`,
          showConfirmButton: false,
          timer: 1500
        })
        console.log(`Account ${accInQueueToWL} was successfully added to the WhiteList`);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Good try, but you\'re not Whitelisted',
          footer: '<a href="">Why do I have this issue?</a>'
        })
        console.log('Good try, but you\'re not Whitelisted');
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Owner can\'t be added to the WL again',
        footer: '<a href="">Why do I have this issue?</a>'
      })
      console.log('Owner can\'t be added to the WL again');
    }
  }

  const deleteAddressesFromTheWhitelist = async function(){
    if(accInQueueToWL !== getOwnerAddress){
      const [, signer, contract] = PSC();
      WLCheck(signer);
      if({whitelistedAcc}){
        await contract.deleteAddressesFromWhitelist(delFromWL);
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: `Account ${delFromWL} was successfully deleted from the WhiteList`,
          showConfirmButton: false,
          timer: 1500
        })
        console.log(`Account ${delFromWL} was successfully deleted from the WhiteList`);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Good try, but you\'re not Whitelisted',
          footer: '<a href="">Why do I have this issue?</a>'
        })
        console.log('Good try, but you\'re not Whitelisted');
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Owner can\'t be removed',
        footer: '<a href="">Why do I have this issue?</a>'
      })
      console.log('Owner can\'t be removed');
    }
  }

  const mint = async function(){
    const [, signer, contract] = PSC();
    WLCheck(signer);
    if({whitelistedAcc}){
      const access = await contract._mint(mintAcc, amount);
      let timerInterval
      Swal.fire({
        title: 'Coin minting!',
        html: 'Coins will be minted in <b></b> milliseconds.',
        timer: 35000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading()
          const b = Swal.getHtmlContainer().querySelector('b')
          timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft()
          }, 100)
        },
        willClose: () => {
          clearInterval(timerInterval)
        }
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          console.log('I was closed by the timer')
        }
      })
      await access.wait();
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: `Coins were successfully minted`,
        showConfirmButton: false,
        timer: 1500
      })
      console.log(`Coins were successfully minted`);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Good try, but you\'re not Whitelisted',
        footer: '<a href="">Why do I have this issue?</a>'
      })
    }
  }


  const burn = async function(){
    const [, signer, contract] = PSC();
    WLCheck(signer);
    if({whitelistedAcc}){
      const access = await contract._burn(burnAcc, amount);
      let timerInterval
      Swal.fire({
        title: 'Coin burning!',
        html: 'Coins will be burned in <b></b> milliseconds.',
        timer: 35000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading()
          const b = Swal.getHtmlContainer().querySelector('b')
          timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft()
          }, 100)
        },
        willClose: () => {
          clearInterval(timerInterval)
        }
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          console.log('I was closed by the timer')
        }
      })
      await access.wait();
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: `Coins were successfully burned`,
        showConfirmButton: false,
        timer: 1500
      })
      console.log(`Coins were successfully burned`);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Good try, but you\'re not Whitelisted',
        footer: '<a href="">Why do I have this issue?</a>'
      })
    }
  }

  const transfer = async function(){
    const [, , contract] = PSC();
    try{
      const trans = await contract.transfer(toAccount, amount);
      let timerInterval
      Swal.fire({
        title: 'Coin transfering!',
        html: 'Coins will be transfered in <b></b> milliseconds.',
        timer: 20000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading()
          const b = Swal.getHtmlContainer().querySelector('b')
          timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft()
          }, 100)
        },
        willClose: () => {
          clearInterval(timerInterval)
        }
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          console.log('I was closed by the timer')
        }
      })
      await trans.wait();
      console.log(`Coins were successfully transfered to ${toAccount}`);
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: `Coins were successfully transfered to ${toAccount}`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong! Please check your wallet',
        footer: '<a href="">Why do I have this issue?</a>'
      })
      console.log("Something went wrong! Please check your wallet");
    }
  }

  async function view(){
    getTokenName();
    getOwnerAddress();
    getTokenTotalSupply();
    getTokenSymbol();
  }





  return (
    <div className="App">
      <div className='connection'>
        <h2>Account address: {account}</h2>
        <h3>{tokenName} Balance: {balance} {symbol}</h3>
        <button onClick={connection}>Connect</button>
      </div>

      <div className='mintAndBurn'>
        <div className='input'>
          <h5>Mint and burn</h5>
          <input onChange={e => setMintAcc(e.target.value)} placeholder="Add minting account" />
          <input onChange={e => setAmount(e.target.value)} placeholder="Add amount of coins to mint" />
          <p><button type='submit' onClick={mint}>Submit</button></p>  
      </div> 

        <div className='input'>
          <input onChange={e => setBurnAcc(e.target.value)} placeholder="Add burning account" />
          <input onChange={e => setAmount(e.target.value)} placeholder="Add amount of coins to burn" />
          <p><button type='submit' onClick={burn}>Submit</button></p>  
        </div>
      </div>

    <div className='trans'>
      <div className='transfer'>
        <div className='input'>
          <h5>Transaction</h5>
          <input onChange={e => setToAccount(e.target.value)} placeholder="Add account to which wallet should be sent tokens" />
          <input onChange={e => setAmount(e.target.value)} placeholder="Add amount of coins to transfer" />
          <p><button type='submit' onClick={transfer}>Submit</button></p>  
        </div>
      </div>
    </div>

      <div className='whitelist'>
        <h5>WhiteList actions</h5>
        <div className='input'>
          <input onChange={e => setAccInQueueToWL(e.target.value)} placeholder="Add account you want to add to the WL" />
          <p><button type='submit' onClick={addAddressesToTheWhitelist}>Submit</button></p>  
        </div>

        <div className='input'>
          <input onChange={e => setDelFromWL(e.target.value)} placeholder="Add account you want to delete from the WL" />
          <p><button type='submit' onClick={deleteAddressesFromTheWhitelist}>Submit</button></p>  
        </div>
      </div>
    </div>
  );
}

export default App; 