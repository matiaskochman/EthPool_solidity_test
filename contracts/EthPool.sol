pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";
contract EthPool is AccessControl{

  uint private totalStaked = 0; // T
  uint private totalRewards = 0; // S
  mapping(address => uint) private clientStake; // S0
  mapping(address => uint) private snapshotRewards;

  uint private constant MULTIPLIER = 100000;

    // Roles
  bytes32 public constant ETH_POOL_TEAM = keccak256("ETH_POOL_TEAM");

  // Event emitted when a user makes a deposit
  event Deposit(
      address indexed _from, // account of user who deposited
      uint256 stakedAmount, // amount of token that was deposited,
      uint256 totalStaked
  );
  // Event emitted when a user makes a withdrawal
  event Withdraw(
      address indexed _from, // account of user who withdrew funds      
      uint256 unstaked, // amount of token that was withdrawn
      uint256 reward
  );
  event Distribute(
    uint totalStaked, 
    uint totalRewards
  );
  constructor() {
    // Grant roles
    _setupRole(ETH_POOL_TEAM, _msgSender());

  }

  function deposit() payable external {
    clientStake[msg.sender] = msg.value;
    snapshotRewards[msg.sender] = totalRewards;
    totalStaked = totalStaked + msg.value;
    emit Deposit(msg.sender, msg.value, totalStaked);
  }

  function distribute() payable external onlyRole(ETH_POOL_TEAM){
    require(totalStaked != 0, "cannot distribute because there is nothing staked");
    uint val = msg.value / totalStaked;
    totalRewards = totalRewards + (msg.value * MULTIPLIER / totalStaked);
    emit Distribute(totalStaked, totalRewards);
  }

  function withdraw() external {
    require(totalStaked > 0, "no deposits in the contract");
    require(clientStake[msg.sender] > 0, "no funds to withdraw for the client");
    uint deposited = clientStake[msg.sender];
    clientStake[msg.sender] = 0;
    uint reward = deposited * (totalRewards - snapshotRewards[msg.sender]);
    totalStaked = totalStaked - deposited;
    
    uint val = reward / MULTIPLIER;
    uint total = deposited + val;
    (bool sent, ) = payable(msg.sender).call{value: total}("");
    require(sent, "Failed to send Ether");

    emit Withdraw(msg.sender, deposited, val);
    // console.log("deposited: ", deposited, " reward: ", reward);
  }
    // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}

}