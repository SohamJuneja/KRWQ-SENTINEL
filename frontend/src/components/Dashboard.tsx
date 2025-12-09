import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Award, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface Stats {
  totalTips: number;
  verifiedTips: number;
  verificationRate: string;
  avgConfidence: string;
  totalCommissionEarned: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/tips/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!stats) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
        <div className="animate-pulse">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Intelligence Network Stats</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Tips"
          value={stats.totalTips.toString()}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Verified"
          value={stats.verifiedTips.toString()}
          color="green"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Success Rate"
          value={`${stats.verificationRate}%`}
          color="purple"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Avg Confidence"
          value={`${stats.avgConfidence}%`}
          color="yellow"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Commission"
          value={`${stats.totalCommissionEarned}%`}
          color="green"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5" />}
          label="Rejected"
          value={(stats.totalTips - stats.verifiedTips).toString()}
          color="red"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/20',
    green: 'text-green-400 bg-green-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20',
    red: 'text-red-400 bg-red-500/20',
  };

  return (
    <div className="bg-white/10 rounded-lg p-4">
      <div className={`inline-flex p-2 rounded-lg mb-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}