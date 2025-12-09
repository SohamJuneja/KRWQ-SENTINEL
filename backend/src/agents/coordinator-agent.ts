import { SequentialAgent } from "@iqai/adk";
import { intelVerificationAgent } from "./intel-verification-agent.js";
import { tradingStrategyAgent } from "./trading-strategy-agent.js";
import { riskAssessmentAgent } from "./risk-assessment-agent.js";
import { commissionCalculatorAgent } from "./commission-calculator-agent.js";

/**
 * KRWQ Sentinel Coordinator Agent
 * Orchestrates the complete intelligence verification → trading workflow
 * 
 * Pipeline:
 * 1. Intel Verification (verifies tip with web search)
 * 2. Trading Strategy (analyzes arbitrage opportunity)
 * 3. Risk Assessment (evaluates trade safety)
 * 4. Commission Calculation (rewards tip provider)
 */
export const coordinatorAgent = new SequentialAgent({
  name: "krwq_sentinel_coordinator",
  description: "Community-powered DeFAI hedge fund that verifies tips and executes KRWQ-FRAX arbitrage trades",
  
  subAgents: [
    intelVerificationAgent,      // Step 1: Verify the tip
    tradingStrategyAgent,         // Step 2: Create strategy
    riskAssessmentAgent,          // Step 3: Assess risk
    commissionCalculatorAgent,    // Step 4: Calculate reward
  ],
});