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

  it("deposit eth, distribute and withdraw", async function () {
    const amountBefore = await ethers.provider.getBalance(acc1.address);
    console.log(amountBefore);
    const deposit = ethers.utils.parseEther("10.0");
    const reward = ethers.utils.parseEther("3.3333");

    let tx = await eth_pool.connect(acc1).deposit({ value: deposit });
    let receipt = await tx.wait();
    await eth_pool.connect(acc2).deposit({ value: deposit });
    await eth_pool.connect(acc3).deposit({ value: deposit });
    await eth_pool.connect(owner).distribute({ value: deposit });
    const gas1 = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    console.log("gas1: ", ethers.utils.formatUnits(gas1, 0));

    await expect((tx = await eth_pool.connect(acc1).withdraw()))
      .to.emit(eth_pool, "Withdraw")
      .withArgs(acc1.address, deposit, reward);
    receipt = await tx.wait();

    const gas2 = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    console.log("gas2: ", ethers.utils.formatUnits(gas2, 0));

    const gasTotal = gas1.add(gas2);
    console.log("gasTotal: ", ethers.utils.formatUnits(gasTotal, 18));

    await eth_pool.connect(acc2).withdraw();
    await eth_pool.connect(acc3).withdraw();

    expect(
      await (await ethers.provider.getBalance(acc1.address)).add(gasTotal)
    ).equals(amountBefore.add(reward));
  });

  it("distribute fails: distributor is not ETH_POOL_TEAM", async function () {
    const amount = ethers.utils.parseEther("10.0");
    await expect(
      eth_pool.connect(acc1).distribute({ value: amount.div(100) })
    ).to.be.revertedWith("AccessControl");
  });
});
