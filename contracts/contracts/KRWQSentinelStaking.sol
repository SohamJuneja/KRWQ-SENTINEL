// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KRWQ Sentinel Staking Contract
 * @notice Allows users to stake ETH to submit intelligence tips
 * @dev Implements stake requirements and commission distribution
 */
contract KRWQSentinelStaking is Ownable, ReentrancyGuard {
    // Minimum stake required to submit tips (0.01 ETH for demo)
    uint256 public constant MIN_STAKE = 0.01 ether;
    
    // Mapping of user address to their staked amount
    mapping(address => uint256) public stakes;
    
    // Mapping of user address to their earned commission
    mapping(address => uint256) public commissions;
    
    // Array of all stakers for leaderboard
    address[] public stakers;
    mapping(address => bool) public isStaker;
    
    // Total staked in the contract
    uint256 public totalStaked;
    
    // Total commissions distributed
    uint256 public totalCommissionsDistributed;
    
    // Number of tips submitted
    uint256 public totalTipsSubmitted;
    
    // Number of verified tips
    uint256 public totalTipsVerified;
    
    // Agent wallet that can distribute commissions
    address public agentWallet;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 totalStake);
    event Unstaked(address indexed user, uint256 amount);
    event CommissionPaid(address indexed user, uint256 amount, uint256 tipQuality, string tipId);
    event CommissionWithdrawn(address indexed user, uint256 amount);
    event TipSubmitted(address indexed user, string tipId);
    event TipVerified(address indexed user, string tipId, bool verified);
    
    constructor() Ownable(msg.sender) {
        agentWallet = msg.sender;
    }
    
    /**
     * @notice Stake ETH to get access to submit tips
     */
    function stake() external payable nonReentrant {
        require(msg.value > 0, "Must stake some ETH");
        
        // Add to stakers list if first time
        if (!isStaker[msg.sender] && stakes[msg.sender] == 0) {
            stakers.push(msg.sender);
            isStaker[msg.sender] = true;
        }
        
        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value, stakes[msg.sender]);
    }
    
    /**
     * @notice Unstake your ETH (if no pending commissions)
     */
    function unstake(uint256 amount) external nonReentrant {
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        require(amount > 0, "Amount must be greater than 0");
        
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @notice Check if user has minimum stake to submit tips
     */
    function hasMinimumStake(address user) external view returns (bool) {
        return stakes[user] >= MIN_STAKE;
    }
    
    /**
     * @notice Record a tip submission
     */
    function recordTipSubmission(address user, string memory tipId) external onlyAgent {
        require(stakes[user] >= MIN_STAKE, "User must stake minimum amount");
        totalTipsSubmitted++;
        emit TipSubmitted(user, tipId);
    }
    
    /**
     * @notice Record a tip verification result
     */
    function recordTipVerification(
        address user,
        string memory tipId,
        bool verified
    ) external onlyAgent {
        if (verified) {
            totalTipsVerified++;
        }
        emit TipVerified(user, tipId, verified);
    }
    
    /**
     * @notice Distribute commission to a tip provider (called by agent)
     * @param provider Address of the tip provider
     * @param amount Commission amount to distribute
     * @param tipQuality Quality score of the tip (0-100)
     * @param tipId Unique identifier for the tip
     */
    function distributeCommission(
        address provider,
        uint256 amount,
        uint256 tipQuality,
        string memory tipId
    ) external payable onlyAgent {
        require(stakes[provider] >= MIN_STAKE, "Provider not staked");
        require(tipQuality >= 50, "Tip quality too low for commission");
        require(msg.value == amount, "Incorrect commission amount");
        
        commissions[provider] += amount;
        totalCommissionsDistributed += amount;
        
        emit CommissionPaid(provider, amount, tipQuality, tipId);
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
        require(_agentWallet != address(0), "Invalid agent wallet");
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
        uint256 _minStake,
        uint256 _totalTips,
        uint256 _verifiedTips,
        uint256 _numStakers
    ) {
        _totalStaked = totalStaked;
        _totalCommissions = totalCommissionsDistributed;
        _minStake = MIN_STAKE;
        _totalTips = totalTipsSubmitted;
        _verifiedTips = totalTipsVerified;
        _numStakers = stakers.length;
    }
    
    /**
     * @notice Get leaderboard of top stakers
     */
    function getTopStakers(uint256 limit) external view returns (
        address[] memory topAddresses,
        uint256[] memory topStakes
    ) {
        uint256 numStakers = stakers.length;
        uint256 resultSize = limit < numStakers ? limit : numStakers;
        
        topAddresses = new address[](resultSize);
        topStakes = new uint256[](resultSize);
        
        // Simple bubble sort for top stakers (fine for small datasets)
        address[] memory sortedAddresses = new address[](numStakers);
        uint256[] memory sortedStakes = new uint256[](numStakers);
        
        for (uint256 i = 0; i < numStakers; i++) {
            sortedAddresses[i] = stakers[i];
            sortedStakes[i] = stakes[stakers[i]];
        }
        
        // Sort descending
        for (uint256 i = 0; i < numStakers; i++) {
            for (uint256 j = i + 1; j < numStakers; j++) {
                if (sortedStakes[i] < sortedStakes[j]) {
                    // Swap stakes
                    uint256 tempStake = sortedStakes[i];
                    sortedStakes[i] = sortedStakes[j];
                    sortedStakes[j] = tempStake;
                    
                    // Swap addresses
                    address tempAddr = sortedAddresses[i];
                    sortedAddresses[i] = sortedAddresses[j];
                    sortedAddresses[j] = tempAddr;
                }
            }
        }
        
        // Return top N
        for (uint256 i = 0; i < resultSize; i++) {
            topAddresses[i] = sortedAddresses[i];
            topStakes[i] = sortedStakes[i];
        }
        
        return (topAddresses, topStakes);
    }
    
    modifier onlyAgent() {
        require(msg.sender == agentWallet || msg.sender == owner(), "Only agent or owner can call");
        _;
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}