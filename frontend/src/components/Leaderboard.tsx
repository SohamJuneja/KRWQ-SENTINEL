import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Award, TrendingUp, Target } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  totalTips: number;
  verifiedTips: number;
  totalCommission: number;
  avgConfidence: number;
  avgQuality: number;
  successRate: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/leaderboard?limit=5');
      setLeaderboard(response.data.leaderboard);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
        <div className="animate-pulse">Loading leaderboard...</div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Top Intelligence Providers</h2>
        </div>
        <p className="text-gray-400 text-center py-8">
          No intelligence providers yet. Be the first to submit a tip!
        </p>
      </div>
    );
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Award className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return <Target className="w-5 h-5 text-purple-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 0:
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40';
      case 1:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/40';
      case 2:
        return 'from-orange-500/20 to-red-500/20 border-orange-500/40';
      default:
        return 'from-purple-500/10 to-blue-500/10 border-purple-500/30';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">Top Intelligence Providers</h2>
        <div className="ml-auto text-sm text-gray-400">Live Rankings</div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.userId}
            className={`bg-gradient-to-r ${getRankColor(index)} backdrop-blur-md border rounded-lg p-4 hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0">
                {getMedalIcon(index)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white truncate">
                    {entry.userId}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      👑 Top Earner
                    </span>
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-300">
                  <div>
                    <span className="text-gray-400">Tips:</span>{' '}
                    <span className="font-semibold">{entry.totalTips}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Verified:</span>{' '}
                    <span className="font-semibold text-green-400">
                      {entry.verifiedTips}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Success:</span>{' '}
                    <span className="font-semibold text-blue-400">
                      {entry.successRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Earned */}
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-green-400">
                  {entry.totalCommission.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Total Commission</div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Avg Confidence:</span>{' '}
                  <span className="font-semibold text-purple-300">
                    {entry.avgConfidence.toFixed(0)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400">Quality Score:</span>{' '}
                  <span className="font-semibold text-yellow-300">
                    {entry.avgQuality.toFixed(0)}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-purple-500/30 text-center">
        <p className="text-sm text-gray-400">
          <TrendingUp className="w-4 h-4 inline mr-1" />
          Earn commission by providing verified market intelligence
        </p>
      </div>
    </div>
  );
}
