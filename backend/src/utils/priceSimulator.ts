/**
 * Price Simulator for KRWQ-FRAX Trading
 * Simulates realistic price movements and trading execution
 */

interface PriceData {
  krwqPrice: number;
  fraxPrice: number;
  timestamp: Date;
  volume24h: number;
  priceChange24h: number;
}

interface Trade {
  id: string;
  type: 'BUY' | 'SELL';
  pair: string;
  amount: number;
  price: number;
  timestamp: Date;
  profit: number;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

// Initial prices
let currentKRWQPrice = 0.0012; // $0.0012 per KRWQ
let currentFRAXPrice = 0.9998; // $0.9998 FRAX (slightly under $1)

// Trade history
const tradeHistory: Trade[] = [];
let totalProfitUSD = 0;

/**
 * Simulate realistic price movements
 */
function updatePrices() {
  // KRWQ volatility: ±0.5% per update
  const krwqChange = (Math.random() - 0.5) * 0.01;
  currentKRWQPrice *= (1 + krwqChange);
  
  // FRAX is a stablecoin - very low volatility ±0.01%
  const fraxChange = (Math.random() - 0.5) * 0.0002;
  currentFRAXPrice = Math.max(0.995, Math.min(1.005, currentFRAXPrice * (1 + fraxChange)));
}

// Update prices every 10 seconds
setInterval(updatePrices, 10000);

/**
 * Get current market data
 */
export function getCurrentPrices(): PriceData {
  return {
    krwqPrice: currentKRWQPrice,
    fraxPrice: currentFRAXPrice,
    timestamp: new Date(),
    volume24h: 1250000 + Math.random() * 250000, // $1.25M - $1.5M
    priceChange24h: (Math.random() - 0.5) * 5, // ±2.5%
  };
}

/**
 * Execute a simulated trade
 */
export function executeTrade(
  type: 'BUY' | 'SELL',
  amountUSD: number,
  expectedProfit: number
): Trade {
  const trade: Trade = {
    id: `trade_${Date.now()}`,
    type,
    pair: 'KRWQ-FRAX',
    amount: amountUSD,
    price: type === 'BUY' ? currentKRWQPrice : currentFRAXPrice,
    timestamp: new Date(),
    profit: expectedProfit,
    status: 'PENDING',
  };

  // Simulate execution delay
  setTimeout(() => {
    trade.status = 'EXECUTED';
    totalProfitUSD += expectedProfit;
    console.log(`✅ Trade executed: ${type} $${amountUSD} at ${trade.price.toFixed(6)}, Profit: $${expectedProfit.toFixed(2)}`);
  }, 2000);

  tradeHistory.push(trade);
  
  // Keep only last 50 trades
  if (tradeHistory.length > 50) {
    tradeHistory.shift();
  }

  return trade;
}

/**
 * Calculate arbitrage opportunity
 */
export function calculateArbitrageOpportunity(): {
  exists: boolean;
  profitPct: number;
  recommendation: string;
} {
  // Generate realistic arbitrage spread: 0.3% - 2.0%
  const spread = 0.3 + Math.random() * 1.7; // Random between 0.3% and 2%
  
  return {
    exists: spread > 0.5,
    profitPct: spread,
    recommendation: spread > 0.5 
      ? `BUY KRWQ at $${currentKRWQPrice.toFixed(6)}, SELL for FRAX` 
      : 'No arbitrage opportunity detected',
  };
}

/**
 * Get trading statistics
 */
export function getTradingStats() {
  const executedTrades = tradeHistory.filter(t => t.status === 'EXECUTED');
  const winningTrades = executedTrades.filter(t => t.profit > 0);
  
  return {
    totalTrades: tradeHistory.length,
    executedTrades: executedTrades.length,
    pendingTrades: tradeHistory.filter(t => t.status === 'PENDING').length,
    totalProfitUSD: totalProfitUSD.toFixed(2),
    winRate: executedTrades.length > 0 
      ? ((winningTrades.length / executedTrades.length) * 100).toFixed(1)
      : '0',
    recentTrades: tradeHistory.slice(-10).reverse(),
  };
}

/**
 * Simulate a trade based on verified intelligence
 */
export function simulateIntelligenceTrade(
  verified: boolean,
  confidence: number,
  tipQuality: number
): Trade | null {
  // LOWER THRESHOLDS FOR DEMO
  if (!verified || confidence < 50 || tipQuality < 30) {
    console.log('❌ Trade rejected: insufficient confidence or quality');
    console.log(`   Verified: ${verified}, Confidence: ${confidence}, Quality: ${tipQuality}`);
    return null;
  }

  // Calculate position size based on confidence
  const baseAmount = 1000; // $1000 base
  const confidenceMultiplier = confidence / 100;
  const positionSize = baseAmount * confidenceMultiplier;

  // Calculate expected profit (simplified)
  const arb = calculateArbitrageOpportunity();
  const expectedProfit = positionSize * (arb.profitPct / 100);

  console.log(`\n💰 Executing trade based on verified intelligence:`);
  console.log(`   Position: $${positionSize.toFixed(2)}`);
  console.log(`   Expected Profit: $${expectedProfit.toFixed(2)} (${arb.profitPct.toFixed(2)}%)\n`);

  return executeTrade('BUY', positionSize, expectedProfit);
}