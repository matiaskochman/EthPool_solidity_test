/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EthPool", function () {
  let eth_pool;
  let owner, acc1, acc2, acc3, acc4, acc5, acc6, acc7, acc8;

  beforeEach("deployment setup", async function () {
    [owner, acc1, acc2, acc3, acc4, acc5, acc6, acc7, acc8] =
      await ethers.getSigners();
    const EthPoolFactory = await ethers.getContractFactory("EthPool");
    eth_pool = await EthPoolFactory.deploy();
    await eth_pool.deployed();
  });

  it("deposit eth, distribute and withdraw", async function () {
    const amountBefore = await ethers.provider.getBalance(acc1.address);
    const deposit = ethers.utils.parseEther("10.0");
    const reward = ethers.utils.parseEther("3.333333333333333333");

    let tx = await eth_pool.connect(acc1).deposit({ value: deposit });
    let receipt = await tx.wait();
    await eth_pool.connect(acc2).deposit({ value: deposit });
    await eth_pool.connect(acc3).deposit({ value: deposit });
    await eth_pool.connect(owner).distribute({ value: deposit });
    const gas1 = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    await expect((tx = await eth_pool.connect(acc1).withdraw()))
      .to.emit(eth_pool, "Withdraw")
      .withArgs(acc1.address, deposit, reward);
    receipt = await tx.wait();

    const gas2 = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    const gasTotal = gas1.add(gas2);

    await eth_pool.connect(acc2).withdraw();
    await eth_pool.connect(acc3).withdraw();

    expect(await (await ethers.provider.getBalance(acc1.address)).add(gasTotal)).equals(amountBefore.add(reward));
  });

  it("deposit eth 2 times with same account, distribute and withdraw", async function () {
    // const amountBefore = await ethers.provider.getBalance(eth_pool.address);
    // console.log("balance contract: ", amountBefore.toString());
    const deposit = ethers.utils.parseEther("10.0");
    const reward = ethers.utils.parseEther("10.0");

    // const deposit = ethers.utils.parseEther("0.001");
    // const reward = ethers.utils.parseEther("0.001");

    // deposit 2 times in the acc1
    await eth_pool.connect(acc1).deposit({ value: deposit });
    // await eth_pool.connect(acc1).deposit({ value: deposit });

    // deposit 1 time in acc2
    await eth_pool.connect(acc2).deposit({ value: deposit.mul(2) });
    await eth_pool.connect(owner).distribute({ value: deposit.mul(2) });

    // const amountAfter = await ethers.provider.getBalance(eth_pool.address);
    // const bal1 = await ethers.provider.getBalance(acc1.address);
    // console.log("balance acc1: ", bal1.toString());
    // console.log("balance contract: ", amountAfter.toString());

    let tx, rec;
    tx = await eth_pool.connect(acc1).withdraw();
    rec = await tx.wait();
    console.log(rec.events[0].args[2]);
    let n1 = rec.events[0].args[2];
    tx = await eth_pool.connect(acc2).withdraw();
    rec = await tx.wait();
    console.log(rec.events[0].args[2]);
    n1 = n1.add(rec.events[0].args[2]);
    console.log("suma: ", n1.toString())

    const amountBefore = await ethers.provider.getBalance(eth_pool.address);
    console.log("balance contract: ", amountBefore.toString());
    n1 = n1.add(amountBefore);

    console.log("amount distri: ", n1.toString())

    // reward for acc1 should be 20 eth
    // deposit for acc1 should be 20 eth because there are 2 deposits.
    // await expect(await eth_pool.connect(acc1).withdraw())
    //   .to.emit(eth_pool, "Withdraw")
    //   .withArgs(acc1.address, deposit, reward.mul(2));

    // await expect(await eth_pool.connect(acc2).withdraw())
    // .to.emit(eth_pool, "Withdraw")
    // .withArgs(acc2.address, deposit, reward);

  });


  it("distribute fails: distributor is not ETH_POOL_TEAM", async function () {
    const amount = ethers.utils.parseEther("10.0");
    await expect(eth_pool.connect(acc1).distribute({ value: amount.div(100) })).to.be.revertedWith("AccessControl");
  });

  it("should be rejected with: no deposits in the contract", async function () {
    await expect(eth_pool.connect(acc1).withdraw()).to.be.revertedWith("no deposits in the contract");
  });

  it("should be rejected with: no funds to withdraw for the client", async function () {
    const deposit = ethers.utils.parseEther("10.0");

    // await eth_pool.connect(acc1).deposit({ value: deposit });
    await eth_pool.connect(acc2).deposit({ value: deposit });
    await eth_pool.connect(acc3).deposit({ value: deposit });
    await eth_pool.connect(owner).distribute({ value: deposit });

    await expect(eth_pool.connect(acc1).withdraw()).to.be.revertedWith(
      "no funds to withdraw for the client"
    );
  });
  it("should reproduce first example correctly", async function () {
    await acc8.sendTransaction({to: acc1.address,value: ethers.utils.parseEther("1.0")});
    await acc8.sendTransaction({to: owner.address,value: ethers.utils.parseEther("98.0")});

    await acc7.sendTransaction({to: acc2.address,value: ethers.utils.parseEther("99.0")});
    await acc6.sendTransaction({to: acc2.address,value: ethers.utils.parseEther("99.0")});
    await acc5.sendTransaction({to: acc2.address,value: ethers.utils.parseEther("99.0")});
    await acc4.sendTransaction({to: owner.address,value: ethers.utils.parseEther("99.0")});

    // acc1 deposits 100
    await eth_pool.connect(acc1).deposit({ value: ethers.utils.parseEther("100.0") });
    // acc2 depostis 300
    await eth_pool.connect(acc2).deposit({ value: ethers.utils.parseEther("300.0") });
    // ETH_POOL distributes 200
    await eth_pool.connect(owner).distribute({ value: ethers.utils.parseEther("200.0") });

    await expect(await eth_pool.connect(acc1).withdraw()).to.emit(eth_pool, "Withdraw")
    .withArgs(acc1.address, ethers.utils.parseEther("100.0"), ethers.utils.parseEther("50.0"));

    await expect(await eth_pool.connect(acc2).withdraw()).to.emit(eth_pool, "Withdraw")
    .withArgs(acc2.address, ethers.utils.parseEther("300.0"), ethers.utils.parseEther("150.0"));
    });
    
    it("should reproduce second example correctly", async function () {
      await acc8.sendTransaction({to: acc1.address,value: ethers.utils.parseEther("1.0")});
      await acc8.sendTransaction({to: owner.address,value: ethers.utils.parseEther("98.0")});
  
      await acc7.sendTransaction({to: acc2.address,value: ethers.utils.parseEther("99.0")});
      await acc6.sendTransaction({to: acc2.address,value: ethers.utils.parseEther("99.0")});
      await acc5.sendTransaction({to: acc2.address,value: ethers.utils.parseEther("99.0")});
      await acc4.sendTransaction({to: owner.address,value: ethers.utils.parseEther("99.0")});
  
      // acc1 deposits 100
      await eth_pool.connect(acc1).deposit({ value: ethers.utils.parseEther("100.0") });
      // ETH_POOL distributes 200
      await eth_pool.connect(owner).distribute({ value: ethers.utils.parseEther("200.0") });
      // acc2 depostis 300
      await eth_pool.connect(acc2).deposit({ value: ethers.utils.parseEther("300.0") });
  
      await expect(await eth_pool.connect(acc1).withdraw()).to.emit(eth_pool, "Withdraw")
      .withArgs(acc1.address, ethers.utils.parseEther("100.0"), ethers.utils.parseEther("200.0"));
  
      await expect(await eth_pool.connect(acc2).withdraw()).to.emit(eth_pool, "Withdraw")
      .withArgs(acc2.address, ethers.utils.parseEther("300.0"), ethers.utils.parseEther("0.0"));
    });
  
    it("should reproduce a third example correctly", async function () {
  
      // acc1 deposits 0.001
      await eth_pool.connect(acc1).deposit({ value: ethers.utils.parseEther("0.001") });
      // acc2 depostis 0.003
      await eth_pool.connect(acc2).deposit({ value: ethers.utils.parseEther("0.003") });
      // ETH_POOL distributes 0.002
      await eth_pool.connect(owner).distribute({ value: ethers.utils.parseEther("0.002") });
  
      await expect(await eth_pool.connect(acc1).withdraw()).to.emit(eth_pool, "Withdraw")
      .withArgs(acc1.address, ethers.utils.parseEther("0.001"), ethers.utils.parseEther("0.0005"));
  
      await expect(await eth_pool.connect(acc2).withdraw()).to.emit(eth_pool, "Withdraw")
      .withArgs(acc2.address, ethers.utils.parseEther("0.003"), ethers.utils.parseEther("0.0015"));
      });
  
});
