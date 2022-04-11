pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";
contract EthPool is AccessControl{

  uint private totalStaked = 0; // T
  uint private totalRewards = 0; // S
  mapping(address => uint) private clientStake; // S0
  mapping(address => uint) private snapshotRewards;

  uint private constant MULTIPLIER = 1000;

    // Roles
  bytes32 public constant ETH_POOL_TEAM = keccak256("ETH_POOL_TEAM");

  constructor() {
    // Grant roles
    _setupRole(ETH_POOL_TEAM, _msgSender());

  }

  function deposit() payable external {
    clientStake[msg.sender] = msg.value;
    snapshotRewards[msg.sender] = totalRewards;
    totalStaked = totalStaked + msg.value;
    console.log("totalStaked: ", totalStaked);
  }

  function distribute() payable external onlyRole(ETH_POOL_TEAM){
    require(totalStaked != 0, "cannot distribute because there is nothing staked");
    console.log("rewards: ", msg.value, " totalStaked: ", totalStaked);
    uint val = msg.value / totalStaked;
    totalRewards = totalRewards + (msg.value *MULTIPLIER / totalStaked);
    console.log("totalRewards: ", totalRewards, " val:", val);
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