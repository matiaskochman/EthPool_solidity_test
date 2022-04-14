/* eslint-disable no-process-exit */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const EthPoolFactory = await hre.ethers.getContractFactory("EthPool");
  const ethPool = await EthPoolFactory.deploy();
  await ethPool.deployed();
  console.log("ethPool deployed to:", ethPool.address);


  // let config = `
  // export const ethPoolAddress = "${ethPool.address}"
  // `

  let config = `
  module.exports = {
    ethPoolAddress: "${ethPool.address}",
  };
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
