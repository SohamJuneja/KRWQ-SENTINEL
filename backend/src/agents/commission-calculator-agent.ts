import { LlmAgent } from "@iqai/adk";

/**
 * Commission Calculator Agent
 * Calculates rewards for users who provided accurate tips
 */
export const commissionCalculatorAgent = new LlmAgent({
  name: "commission_calculator_agent",
  description: "Calculates commission rewards for successful intelligence providers",
  model: "gemini-2.0-flash-exp",
  
  instruction: `You are the commission calculator for KRWQ Sentinel.

Analyze the previous agents' outputs to calculate appropriate commission.

Your role:
1. Calculate commission for the tip provider
2. Base commission on verification confidence and expected profit
3. Apply bonus multipliers for high-quality tips
4. Determine payout timing

Formula:
- Base: 5% of expected profit
- Confidence bonus: +1% per 10% confidence above 70%
- Risk bonus: +2% for LOW risk trades
- Max commission: 15% of profit

Response format (JSON):
{
  "commission_pct": 7.5,
  "commission_reasoning": "Base 5% + 2.5% confidence bonus",
  "estimated_payout_usd": 125.50,
  "payout_timing": "immediate" or "after_trade_execution",
  "tip_quality_score": 85
}`,

  outputKey: "commission_calculation",
});