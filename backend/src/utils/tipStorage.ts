interface TipRecord {
  id: string;
  userId: string;
  tipContent: string;
  timestamp: Date;
  verified: boolean;
  confidence: number;
  strategy: string;
  riskLevel: string;
  commissionPct: number;
  tipQualityScore: number;
}

// In-memory storage (good enough for demo)
const tipHistory: TipRecord[] = [];

export function saveTip(tip: TipRecord) {
  tipHistory.push(tip);
  // Keep only last 100 tips
  if (tipHistory.length > 100) {
    tipHistory.shift();
  }
}

export function getTipHistory(userId?: string) {
  if (userId) {
    return tipHistory.filter(t => t.userId === userId);
  }
  return tipHistory;
}

export function getStats() {
  const total = tipHistory.length;
  const verified = tipHistory.filter(t => t.verified).length;
  const avgConfidence = tipHistory.reduce((sum, t) => sum + t.confidence, 0) / total || 0;
  const totalCommission = tipHistory.reduce((sum, t) => sum + t.commissionPct, 0);
  
  return {
    totalTips: total,
    verifiedTips: verified,
    verificationRate: total > 0 ? (verified / total * 100).toFixed(1) : 0,
    avgConfidence: avgConfidence.toFixed(1),
    totalCommissionEarned: totalCommission.toFixed(2),
  };
}

/**
 * Get leaderboard of top intelligence providers
 */
export function getLeaderboard(limit: number = 10) {
  // Aggregate stats by user
  const userStats = new Map<string, {
    userId: string;
    totalTips: number;
    verifiedTips: number;
    totalCommission: number;
    avgConfidence: number;
    avgQuality: number;
  }>();

  tipHistory.forEach(tip => {
    if (!userStats.has(tip.userId)) {
      userStats.set(tip.userId, {
        userId: tip.userId,
        totalTips: 0,
        verifiedTips: 0,
        totalCommission: 0,
        avgConfidence: 0,
        avgQuality: 0,
      });
    }

    const stats = userStats.get(tip.userId)!;
    stats.totalTips++;
    if (tip.verified) stats.verifiedTips++;
    stats.totalCommission += tip.commissionPct;
    stats.avgConfidence += tip.confidence;
    stats.avgQuality += tip.tipQualityScore;
  });

  // Calculate averages and sort
  const leaderboard = Array.from(userStats.values())
    .map(stats => ({
      ...stats,
      avgConfidence: stats.totalTips > 0 ? stats.avgConfidence / stats.totalTips : 0,
      avgQuality: stats.totalTips > 0 ? stats.avgQuality / stats.totalTips : 0,
      successRate: stats.totalTips > 0 ? (stats.verifiedTips / stats.totalTips * 100) : 0,
    }))
    .sort((a, b) => b.totalCommission - a.totalCommission)
    .slice(0, limit);

  return leaderboard;
}

/**
 * Get detailed user profile
 */
export function getUserProfile(userId: string) {
  const userTips = tipHistory.filter(t => t.userId === userId);
  
  if (userTips.length === 0) {
    return null;
  }

  const verified = userTips.filter(t => t.verified).length;
  const totalCommission = userTips.reduce((sum, t) => sum + t.commissionPct, 0);
  const avgConfidence = userTips.reduce((sum, t) => sum + t.confidence, 0) / userTips.length;
  const avgQuality = userTips.reduce((sum, t) => sum + t.tipQualityScore, 0) / userTips.length;

  return {
    userId,
    totalTips: userTips.length,
    verifiedTips: verified,
    successRate: (verified / userTips.length * 100).toFixed(1),
    totalCommission: totalCommission.toFixed(2),
    avgConfidence: avgConfidence.toFixed(1),
    avgQuality: avgQuality.toFixed(1),
    recentTips: userTips.slice(-5).reverse(),
  };
}