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
    const reward = ethers.utils.parseEther("3.3333");

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
  
});
