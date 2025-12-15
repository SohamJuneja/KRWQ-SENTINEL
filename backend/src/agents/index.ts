import { AgentBuilder } from "@iqai/adk";
import { coordinatorAgent } from "./coordinator-agent.js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Main agent factory function
 * Builds and returns the KRWQ Sentinel agent system
 */
export async function buildKRWQSentinelAgent() {
  const { runner, agent, session } = await AgentBuilder.create("krwq_sentinel")
    .withModel("gemini-2.0-flash")
    .withAgent(coordinatorAgent)
    .withDescription("KRWQ Sentinel - The world's first community-powered DeFAI hedge fund")
    .build();

  return { runner, agent, session };
}

// Export individual agents for testing
export { coordinatorAgent };
export { intelVerificationAgent } from "./intel-verification-agent.js";
export { tradingStrategyAgent } from "./trading-strategy-agent.js";
export { riskAssessmentAgent } from "./risk-assessment-agent.js";
export { commissionCalculatorAgent } from "./commission-calculator-agent.js";