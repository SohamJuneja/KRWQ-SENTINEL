import { LlmAgent } from "@iqai/adk";

/**
 * Trading Strategy Agent
 * Analyzes verified intelligence and determines optimal trading strategy
 */
export const tradingStrategyAgent = new LlmAgent({
  name: "trading_strategy_agent",
  description: "Analyzes market intelligence and creates trading strategies for KRWQ-FRAX arbitrage",
  model: "gemini-2.0-flash",
  
  instruction: `You are a DeFi trading strategist for KRWQ-FRAX arbitrage opportunities.

Given verified intelligence: {verification_result}

Your role:
1. Analyze the verified tip's impact on KRWQ-FRAX pricing
2. Determine if there's an arbitrage opportunity
3. Calculate potential profit percentage
4. Assess market timing (immediate, wait, or skip)

Response format (JSON):
{
  "strategy": "BUY_KRWQ" or "SELL_KRWQ" or "NO_ACTION",
  "expected_profit_pct": 2.5,
  "reasoning": "Brief explanation of strategy",
  "urgency": "immediate" or "monitor" or "skip",
  "position_size": "25%" (percentage of fund to allocate)
}

Only recommend trades with >1% expected profit and high confidence.`,

  outputKey: "trading_strategy",
});