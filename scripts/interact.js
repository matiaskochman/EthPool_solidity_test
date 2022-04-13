/* eslint-disable camelcase */
/* eslint-disable node/no-missing-require */
const EthPoolJson = require("../artifacts/contracts/EthPool.sol/EthPool.json");
require("dotenv").config();
const { ethers } = require("ethers");

const contractAddress = "0x560A848D1A49d800f948f33F84AD41235FA257Fc";
const provider = new ethers.providers.AlchemyProvider("kovan");

const owner = new ethers.Wallet(process.env.PRIVATE_KEY_OWNER, provider);
const acc1 = new ethers.Wallet(process.env.PRIVATE_KEY_ACC1, provider);
const acc2 = new ethers.Wallet(process.env.PRIVATE_KEY_ACC2, provider);
const contract_owner = new ethers.Contract(contractAddress, EthPoolJson.abi, owner);
const contract_acc1 = new ethers.Contract(
  contractAddress,
  EthPoolJson.abi,
  acc1
);
const contract_acc2 = new ethers.Contract(
  contractAddress,
  EthPoolJson.abi,
  acc2
);

const checkContractBalance = async () => {
  const balance = await provider.getBalance(contractAddress);
  console.log("ethpool balance: ", balance.toString());
};

const deposit = async (amountInEth, contract) => {
  const val = ethers.utils.parseEther(amountInEth);
  return await contract.deposit({ value: val });
};
const distribute = async (amountInEth) => {
  const val = ethers.utils.parseEther(amountInEth);
  return await contract_owner.distribute({ value: val });
}
const withdraw = async (contract) => {
  return await contract.withdraw();
}

// checkContractBalance();
// deposit("0.001", contract_acc1);
// deposit("0.002", contract_acc2);
// checkContractBalance();
// await distribute("0.002");
// checkContractBalance();
// withdraw(contract_acc1);
// withdraw(contract_acc2);
// checkContractBalance();

const excecute = async () => {
  await checkContractBalance();
  let tx, receipt;
  // tx = await deposit("0.001", contract_acc1);
  // receipt = await tx.wait();
  // console.log("tx status: ", receipt.status);

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

excecute();
