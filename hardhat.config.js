require("@nomicfoundation/hardhat-toolbox");



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/266864c9a4a84907be84c6c3d890e4a7`,
      accounts: [`0x3a3acd4da50c1e9a3486f10eec9a3fc1b5c8990f024813465e4b571a8e7f0ce2`],
    },
  }
};
