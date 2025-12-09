// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KRWQ Sentinel Staking Contract
 * @notice Allows users to stake tokens to submit intelligence tips
 * @dev Implements stake requirements and commission distribution
 */
contract KRWQSentinelStaking is Ownable, ReentrancyGuard {
    // Minimum stake required to submit tips (0.1 ETH for demo)
    uint256 public constant MIN_STAKE = 0.1 ether;
    
    // Mapping of user address to their staked amount
    mapping(address => uint256) public stakes;
    
    // Mapping of user address to their earned commission
    mapping(address => uint256) public commissions;
    
    // Total staked in the contract
    uint256 public totalStaked;
    
    // Total commissions distributed
    uint256 public totalCommissionsDistributed;
    
    // Agent wallet that can distribute commissions
    address public agentWallet;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event CommissionPaid(address indexed user, uint256 amount, uint256 tipQuality);
    event CommissionWithdrawn(address indexed user, uint256 amount);
    
    constructor() Ownable(msg.sender) {
        agentWallet = msg.sender;
    }
    
    /**
     * @notice Stake ETH to get access to submit tips
     */
    function stake() external payable nonReentrant {
        require(msg.value >= MIN_STAKE, "Stake amount too low");
        
        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value);
    }
    
    /**
     * @notice Unstake your ETH (if no pending commissions)
     */
    function unstake() external nonReentrant {
        uint256 stakedAmount = stakes[msg.sender];
        require(stakedAmount > 0, "No stake to withdraw");
        require(commissions[msg.sender] == 0, "Withdraw commissions first");
        
        stakes[msg.sender] = 0;
        totalStaked -= stakedAmount;
        
        (bool success, ) = msg.sender.call{value: stakedAmount}("");
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, stakedAmount);
    }
    
    /**
     * @notice Check if user has minimum stake to submit tips
     */
    function hasMinimumStake(address user) external view returns (bool) {
        return stakes[user] >= MIN_STAKE;
    }
    
    /**
     * @notice Distribute commission to a tip provider (called by agent)
     * @param provider Address of the tip provider
     * @param amount Commission amount to distribute
     * @param tipQuality Quality score of the tip (0-100)
     */
    function distributeCommission(
        address provider,
        uint256 amount,
        uint256 tipQuality
    ) external payable onlyAgent {
        require(stakes[provider] >= MIN_STAKE, "Provider not staked");
        require(tipQuality >= 50, "Tip quality too low");
        require(msg.value == amount, "Incorrect commission amount");
        
        commissions[provider] += amount;
        totalCommissionsDistributed += amount;
        
        emit CommissionPaid(provider, amount, tipQuality);
    }
    
    /**
     * @notice Withdraw earned commissions
     */
    function withdrawCommission() external nonReentrant {
        uint256 commission = commissions[msg.sender];
        require(commission > 0, "No commission to withdraw");
        
        commissions[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: commission}("");
        require(success, "Transfer failed");
        
        emit CommissionWithdrawn(msg.sender, commission);
    }
    
    /**
     * @notice Set the agent wallet address
     */
    function setAgentWallet(address _agentWallet) external onlyOwner {
        agentWallet = _agentWallet;
    }
    
    /**
     * @notice Get staking statistics for a user
     */
    function getUserStats(address user) external view returns (
        uint256 stakedAmount,
        uint256 pendingCommission,
        bool canSubmitTips
    ) {
        stakedAmount = stakes[user];
        pendingCommission = commissions[user];
        canSubmitTips = stakedAmount >= MIN_STAKE;
    }
    
    /**
     * @notice Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalCommissions,
        uint256 _minStake
    ) {
        _totalStaked = totalStaked;
        _totalCommissions = totalCommissionsDistributed;
        _minStake = MIN_STAKE;
    }
    
    modifier onlyAgent() {
        require(msg.sender == agentWallet, "Only agent can call");
        _;
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}