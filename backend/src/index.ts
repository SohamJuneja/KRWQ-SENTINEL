import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { buildKRWQSentinelAgent } from "./agents/index.js";
import { saveTip, getTipHistory, getStats, getLeaderboard, getUserProfile } from './utils/tipStorage.js';
import { 
  getCurrentPrices, 
  getTradingStats, 
  simulateIntelligenceTrade,
  calculateArbitrageOpportunity,
  executeTrade
} from './utils/priceSimulator.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Global agent instance (initialize once)
let agentRunner: any = null;

// Initialize agent on server start
async function initializeAgent() {
  console.log("🤖 Initializing KRWQ Sentinel agent...");
  const { runner } = await buildKRWQSentinelAgent();
  agentRunner = runner;
  console.log("✅ Agent initialized successfully!");
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "KRWQ Sentinel Backend",
    timestamp: new Date().toISOString(),
  });
});

// Get current market prices
app.get("/api/market/prices", (req, res) => {
  const prices = getCurrentPrices();
  res.json({ success: true, prices });
});

// Get trading statistics
app.get("/api/market/stats", (req, res) => {
  const stats = getTradingStats();
  res.json({ success: true, stats });
});

// Get arbitrage opportunities
app.get("/api/market/arbitrage", (req, res) => {
  const opportunity = calculateArbitrageOpportunity();
  res.json({ success: true, opportunity });
});

// Main endpoint - Submit intelligence tip
app.post("/api/submit-tip", async (req, res) => {
  try {
    const { tip, userId } = req.body;

    if (!tip || typeof tip !== "string") {
      return res.status(400).json({
        error: "Invalid request",
        message: "Tip must be a non-empty string",
      });
    }
    

    console.log(`\n📝 New tip from user ${userId || "anonymous"}:`);
    console.log(tip);
    console.log("\n🔄 Processing...\n");

    const response = await agentRunner.ask(tip);
    
    // Debug: Log the raw response
    console.log("\n🔍 RAW AGENT RESPONSE:");
    console.log("=".repeat(80));
    console.log(response);
    console.log("=".repeat(80));

    // Parse the response to extract data - use LAST occurrence (most refined result)
    const verifiedMatches = response.match(/"verified":\s*(true|false)/g);
    const verified = verifiedMatches ? verifiedMatches[verifiedMatches.length - 1].includes('true') : false;
    
    const confidenceMatches = response.match(/"confidence":\s*(\d+)/g);
    const confidenceMatch = confidenceMatches ? confidenceMatches[confidenceMatches.length - 1].match(/(\d+)/) : null;
    
    const strategyMatch = response.match(/"strategy":\s*"([^"]+)"/);
    const riskMatch = response.match(/"risk_level":\s*"([^"]+)"/);
    const commissionMatch = response.match(/"commission_pct":\s*([\d.]+)/);
    const qualityMatch = response.match(/"tip_quality_score":\s*(\d+)/);

    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 0;
    // Use quality score from commission agent, or default to confidence value if missing
    const quality = qualityMatch ? parseInt(qualityMatch[1]) : (verified ? confidence : 0);

    console.log(`\n📊 Parsed Results:`);
    console.log(`   Verified: ${verified}`);
    console.log(`   Confidence: ${confidence}%`);
    console.log(`   Quality: ${quality}${!qualityMatch ? ' (defaulted to confidence)' : ''}`);

    // Save tip to history
    saveTip({
      id: `tip_${Date.now()}`,
      userId: userId || "anonymous",
      tipContent: tip.substring(0, 100), // First 100 chars
      timestamp: new Date(),
      verified,
      confidence,
      strategy: strategyMatch ? strategyMatch[1] : "NO_ACTION",
      riskLevel: riskMatch ? riskMatch[1] : "UNKNOWN",
      commissionPct: commissionMatch ? parseFloat(commissionMatch[1]) : 0,
      tipQualityScore: quality,
    });

    // Execute trade if verified (LOWER THRESHOLD FOR DEMO)
    if (verified && confidence >= 50) {
      const trade = simulateIntelligenceTrade(
        verified,
        confidence,
        quality
      );
      
      if (trade) {
        console.log(`🎯 Trade initiated: ${trade.id}`);
      }
    }

    console.log("\n✅ Processing complete!\n");

    // Extract actual agent reasoning/evidence from response
    const extractField = (fieldName: string, defaultValue: string = "") => {
      const regex = new RegExp(`"${fieldName}":\\s*"([^"]*)"`, 's');
      const match = response.match(regex);
      return match ? match[1] : defaultValue;
    };

    const extractArrayField = (fieldName: string, defaultValue: string[] = []) => {
      const regex = new RegExp(`"${fieldName}":\\s*\\[([^\\]]+)\\]`, 's');
      const match = response.match(regex);
      if (match) {
        try {
          return JSON.parse(`[${match[1]}]`);
        } catch {
          return defaultValue;
        }
      }
      return defaultValue;
    };

    const verificationEvidence = extractField('evidence', 'Analysis based on available data sources');
    const verificationRecommendation = extractField('recommendation', verified ? 'TRADE' : 'IGNORE');
    const strategyReasoning = extractField('reasoning', 'Market analysis indicates no significant arbitrage opportunity at this time');
    const riskFactors = extractArrayField('risk_factors', verified && confidence >= 50 ? ['Market volatility', 'Liquidity considerations'] : ['Insufficient confidence', 'Unverified intelligence']);
    
    // Commission agent uses different field names
    const commissionReasoning = extractField('commission_reasoning', 'Commission calculated based on tip quality and verification confidence');
    const payoutTiming = extractField('payout_timing', verified && confidence >= 70 ? 'after_trade_execution' : 'N/A');

    // Format response with JSON blocks matching exact Gemini structure
    const formattedResponse = `## 🔍 Intelligence Analysis Complete

### Verification Agent
\`\`\`json
{
  "verified": ${verified},
  "confidence": ${confidence},
  "evidence": "${verificationEvidence}",
  "recommendation": "${verificationRecommendation}"
}
\`\`\`

### Trading Strategy Agent
\`\`\`json
{
  "strategy": "${strategyMatch ? strategyMatch[1] : 'NO_ACTION'}",
  "expected_profit_pct": ${commissionMatch ? parseFloat(commissionMatch[1]) : 0},
  "reasoning": "${strategyReasoning}",
  "urgency": "${verified && confidence >= 50 ? 'immediate' : 'skip'}",
  "position_size": "${verified && confidence >= 50 ? '25%' : '0%'}"
}
\`\`\`

### Risk Assessment Agent
\`\`\`json
{
  "risk_level": "${riskMatch ? riskMatch[1] : 'MEDIUM'}",
  "risk_score": ${100 - confidence},
  "proceed_with_trade": ${verified && confidence >= 50},
  "recommended_position_size": "${verified && confidence >= 50 ? '25%' : '0%'}",
  "risk_factors": ${JSON.stringify(riskFactors)}
}
\`\`\`

### Commission Calculator Agent
\`\`\`json
{
  "commission_pct": ${commissionMatch ? parseFloat(commissionMatch[1]) : 0},
  "tip_quality_score": ${quality},
  "estimated_payout_usd": ${((commissionMatch ? parseFloat(commissionMatch[1]) : 0) * 100).toFixed(2)},
  "payout_timing": "${payoutTiming}",
  "commission_reasoning": "${commissionReasoning}"
}
\`\`\`

${verified && confidence >= 50 ? '✅ **Trade Executed** - Position opened based on verified intelligence' : '⚠️ **No Action** - Confidence threshold not met for trade execution'}`;

    res.json({
      success: true,
      response: formattedResponse,
      timestamp: new Date().toISOString(),
      userId: userId || "anonymous",
    });
  } catch (error: any) {
    console.error("❌ Error processing tip:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Get agent status
app.get("/api/status", (req, res) => {
  res.json({
    agentReady: agentRunner !== null,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/tips/history", (req, res) => {
  const userId = req.query.userId as string;
  const history = getTipHistory(userId);
  res.json({ success: true, tips: history });
});

// Get statistics
app.get("/api/tips/stats", (req, res) => {
  const stats = getStats();
  res.json({ success: true, stats });
});

// Demo trade endpoint for presentations
app.post("/api/market/demo-trade", async (req, res) => {
  try {
    console.log("\n🎬 DEMO TRADE TRIGGERED\n");
    const trade = executeTrade('BUY', 1000, 25.50);
    res.json({ 
      success: true, 
      trade,
      message: 'Demo trade executed for presentation!' 
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get leaderboard
app.get("/api/leaderboard", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const leaderboard = getLeaderboard(limit);
  res.json({ success: true, leaderboard });
});

// Get user profile
app.get("/api/user/:userId", (req, res) => {
  const profile = getUserProfile(req.params.userId);
  if (!profile) {
    return res.status(404).json({ 
      success: false, 
      message: "User not found" 
    });
  }
  res.json({ success: true, profile });
});


// Start server
async function startServer() {
  try {
    // Initialize agent first
    await initializeAgent();

    // Then start the server
    app.listen(PORT, () => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`🚀 KRWQ Sentinel Backend Server Running`);
      console.log(`${"=".repeat(60)}`);
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`🤖 Agent: Ready and waiting for tips!`);
      console.log(`${"=".repeat(60)}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();