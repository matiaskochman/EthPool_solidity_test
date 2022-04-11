/* eslint-disable camelcase */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EthPool", function () {
  let eth_pool;
  let owner, acc1, acc2, acc3;

  before("deployment setup", async function () {
    [owner, acc1, acc2, acc3] = await ethers.getSigners();
    const EthPoolFactory = await ethers.getContractFactory("EthPool");
    eth_pool = await EthPoolFactory.deploy();
    await eth_pool.deployed();
  });

  it("deposit eth", async function () {
    const amountBefore = await ethers.provider.getBalance(eth_pool.address);
    const amount = ethers.utils.parseEther("10.0");
    await eth_pool.connect(acc1).deposit({ value: amount });
    await eth_pool.connect(acc2).deposit({ value: amount });
    await eth_pool.connect(acc3).deposit({ value: amount });
    // expect(await ethers.provider.getBalance(eth_pool.address)).equals(
    //   amountBefore.add(amount.mul(3))
    // );

    await eth_pool.connect(owner).distribute({ value: amount.div(100) });
    // await eth_pool.connect(acc3).withdraw();
    // await eth_pool.connect(acc3).deposit({ value: amount });
    // await eth_pool.connect(owner).distribute({ value: amount.div(2) });
    await eth_pool.connect(acc1).withdraw();
    await eth_pool.connect(acc2).withdraw();
    await eth_pool.connect(acc3).withdraw();
    // await eth_pool.connect(acc1).withdraw();
  });
});
