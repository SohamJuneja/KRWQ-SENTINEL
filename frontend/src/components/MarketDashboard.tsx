import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Activity, Zap } from 'lucide-react';

interface Prices {
  krwqPrice: number;
  fraxPrice: number;
  volume24h: number;
  priceChange24h: number;
}

interface TradingStats {
  totalTrades: number;
  executedTrades: number;
  totalProfitUSD: string;
  winRate: string;
  recentTrades: any[];
}

export default function MarketDashboard() {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [stats, setStats] = useState<TradingStats | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/market/prices'),
        axios.get('http://localhost:3001/api/market/stats'),
      ]);
      setPrices(pricesRes.data.prices);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  if (!prices || !stats) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
        <div className="animate-pulse">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Price Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">KRWQ Price</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${prices.krwqPrice.toFixed(6)}
          </div>
          <div className={`text-sm mt-1 ${prices.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {prices.priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(prices.priceChange24h).toFixed(2)}%
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">FRAX Price</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${prices.fraxPrice.toFixed(4)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Stablecoin (pegged to $1)
          </div>
        </div>
      </div>

      {/* Trading Stats */}
      <div className="bg-white/5 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Trading Performance</h3>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-purple-300">{stats.totalTrades}</div>
            <div className="text-xs text-gray-400">Total Trades</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">${stats.totalProfitUSD}</div>
            <div className="text-xs text-gray-400">Total Profit</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{stats.winRate}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{stats.executedTrades}</div>
            <div className="text-xs text-gray-400">Executed</div>
          </div>
        </div>

        {/* Recent Trades */}
        {stats.recentTrades.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-500/30">
            <div className="text-sm font-semibold text-gray-300 mb-2">Recent Trades</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stats.recentTrades.slice(0, 5).map((trade: any) => (
                <div key={trade.id} className="flex justify-between items-center text-xs bg-white/5 rounded p-2">
                  <span className={`font-semibold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.type}
                  </span>
                  <span className="text-gray-400">${trade.amount.toFixed(2)}</span>
                  <span className={`${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    trade.status === 'EXECUTED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {trade.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-2 justify-center text-sm text-gray-400">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Live market data • Updates every 5s</span>
      </div>

      {/* Demo Controls */}
      <div className="mt-4 pt-4 border-t border-purple-500/30">
        <button
          onClick={async () => {
            try {
              await axios.post('http://localhost:3001/api/market/demo-trade');
              setTimeout(() => window.location.reload(), 2500);
            } catch (error) {
              console.error('Error:', error);
            }
          }}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <Zap className="w-5 h-5" />
          Execute Demo Trade (For Judges)
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Simulates a successful intelligence-based trade
        </p>
      </div>
    </div>
  );
}