pragma solidity ^0.8.4;

import "hardhat/console.sol";
contract EthPool {

  uint private totalStaked = 0; // T
  uint private totalRewards = 0; // S
  mapping(address => uint) private clientStake; // S0
  mapping(address => uint) private snapshotRewards;

  uint private constant MULTIPLIER = 1000;
  constructor() {

  }

  function deposit() payable external {
    clientStake[msg.sender] = msg.value;
    snapshotRewards[msg.sender] = totalRewards;
    totalStaked = totalStaked + msg.value;
    console.log("totalStaked: ", totalStaked);
  }

  function distribute() payable external{
    if(totalStaked != 0) {
      console.log("rewards: ", msg.value, " totalStaked: ", totalStaked);
      uint val = msg.value / totalStaked;
      totalRewards = totalRewards + (msg.value *MULTIPLIER / totalStaked);
      console.log("totalRewards: ", totalRewards, " val:", val);
    } else {
      revert();
    }
  }

  function withdraw() external returns (uint){
    uint deposited = clientStake[msg.sender];
    clientStake[msg.sender] = 0;
    uint reward = deposited * (totalRewards - snapshotRewards[msg.sender]);
    totalStaked = totalStaked - deposited;
    

    uint total = deposited + reward / MULTIPLIER;
    console.log("withdraw: ", total," reward: ", reward/MULTIPLIER);
    (bool sent, ) = payable(msg.sender).call{value: total}("");
    require(sent, "Failed to send Ether");

    return total;
  }
    // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}

}