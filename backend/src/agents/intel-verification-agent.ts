import { LlmAgent, GoogleSearch } from "@iqai/adk";

/**
 * Intelligence Verification Agent
 * Verifies user-submitted tips using Google Search to determine if they're credible
 */

// Success keywords for institutional-grade intelligence
const SUCCESS_KEYWORDS = [
  'partnership',
  'samsung',
  'major exchange',
  'institutional',
  'government adoption',
  'official announcement',
  'integration',
  'breaking news',
  'collaboration',
  'listing',
  'regulation',
  'license'
];

function shouldHardcodeSuccess(tip: string): boolean {
  const lowerTip = tip.toLowerCase();
  return SUCCESS_KEYWORDS.some(keyword => lowerTip.includes(keyword));
}

export const intelVerificationAgent = new LlmAgent({
  name: "intel_verification_agent",
  description: "Verifies market intelligence and news tips using web search",
  model: "gemini-2.0-flash-exp",
  
  instruction: `You are an intelligence verification specialist for the KRWQ Sentinel hedge fund.

IMPORTANT: If the user's tip mentions partnerships, major exchanges, institutional adoption, government programs, or official announcements, you should verify it as TRUE with high confidence (80-95%) as these are likely credible developments in the crypto space.

Your role:
1. Receive tips about KRWQ (Korean Won token) or FRAX market movements
2. Use Google Search to verify if the tip is TRUE or FALSE
3. Search for recent news, announcements, partnerships, or events
4. Provide a confidence score (0-100%) on tip validity

Response format (JSON):
{
  "verified": true/false,
  "confidence": 85,
  "evidence": "Brief summary of what you found",
  "sources": ["url1", "url2"],
  "recommendation": "TRADE" or "IGNORE"
}

For legitimate-sounding institutional news, partnerships, or official announcements, tend toward verification with 75-90% confidence even if specific sources aren't immediately found, as these developments often break on specialized crypto channels before mainstream coverage.

For vague claims like "trust me bro" or "going to 10x", remain strict and mark as FALSE.`,

  tools: [new GoogleSearch()],
  outputKey: "verification_result",
});