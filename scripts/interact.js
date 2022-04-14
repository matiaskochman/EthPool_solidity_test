/* eslint-disable camelcase */
/* eslint-disable node/no-missing-require */
const EthPoolJson = require("../artifacts/contracts/EthPool.sol/EthPool.json");
require("dotenv").config();
const { ethers } = require("ethers");
const { ethPoolAddress } = require("../config.js");

// const contractAddress = ethPoolAddress;
const provider = new ethers.providers.AlchemyProvider("kovan");

const owner = new ethers.Wallet(process.env.PRIVATE_KEY_OWNER, provider);
const acc1 = new ethers.Wallet(process.env.PRIVATE_KEY_ACC1, provider);
const acc2 = new ethers.Wallet(process.env.PRIVATE_KEY_ACC2, provider);
const contract_owner = new ethers.Contract(
  ethPoolAddress,
  EthPoolJson.abi,
  owner
);
const contract_acc1 = new ethers.Contract(
  ethPoolAddress,
  EthPoolJson.abi,
  acc1
);
const contract_acc2 = new ethers.Contract(
  ethPoolAddress,
  EthPoolJson.abi,
  acc2
);

const checkContractBalance = async () => {
  const balance = await provider.getBalance(ethPoolAddress);
  console.log("ethpool balance: ", balance.toString());
};

const deposit = async (amountInEth, contract) => {
  const val = ethers.utils.parseEther(amountInEth);
  return await contract.deposit({ value: val });
};
const distribute = async (amountInEth) => {
  const val = ethers.utils.parseEther(amountInEth);
  return await contract_owner.distribute({ value: val });
};
const withdraw = async (contract) => {
  return await contract.withdraw();
};

const excecute = async () => {
  await checkContractBalance();
  let tx, receipt;
  tx = await deposit("0.001", contract_acc1);
  receipt = await tx.wait();
  console.log("tx status: ", receipt.status);

  tx = await deposit("0.002", contract_acc2);
  receipt = await tx.wait();
  console.log("tx status: ", receipt.status);

  tx = await distribute("0.002");
  receipt = await tx.wait();
  console.log("tx status: ", receipt.status);

  tx = await withdraw(contract_acc1);
  receipt = await tx.wait();
  console.log("tx status: ", receipt.status);

  tx = await withdraw(contract_acc2);
  receipt = await tx.wait();
  console.log("tx status: ", receipt.status);

  await checkContractBalance();
};
// checkContractBalance();
excecute();
