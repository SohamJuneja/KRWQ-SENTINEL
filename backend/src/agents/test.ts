import { buildKRWQSentinelAgent } from "../index.js";

/**
 * Test script for KRWQ Sentinel
 * Run with: npm run test-agent
 */
async function testAgent() {
  console.log("🚀 Starting KRWQ Sentinel Test...\n");

  try {
    // Build the agent
    console.log("📦 Building agent system...");
    const { runner } = await buildKRWQSentinelAgent();
    console.log("✅ Agent system ready!\n");

    // Test Scenario 1: Positive tip about KRWQ partnership
    console.log("=" .repeat(60));
    console.log("📊 TEST 1: Positive Market Intelligence");
    console.log("=" .repeat(60));
    
    const testTip1 = `
    Tip from user @crypto_whale:
    "BREAKING: Samsung Pay just announced they're integrating KRWQ as a payment option for 50 million Korean users. Official announcement on their blog 2 hours ago."
    `;

    console.log("📝 User Tip:", testTip1);
    console.log("\n🔄 Processing through agent pipeline...\n");

    const result1 = await runner.ask(testTip1);
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ AGENT RESPONSE:");
    console.log("=".repeat(60));
    console.log(result1);
    console.log("\n");

    // Test Scenario 2: Fake/unverifiable tip
    console.log("=" .repeat(60));
    console.log("📊 TEST 2: Unverifiable Intelligence (Should be rejected)");
    console.log("=" .repeat(60));
    
    const testTip2 = `
    Tip from user @anonymous123:
    "I heard from a friend that KRWQ is going to 10x tomorrow. Trust me bro."
    `;

    console.log("📝 User Tip:", testTip2);
    console.log("\n🔄 Processing through agent pipeline...\n");

    const result2 = await runner.ask(testTip2);
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ AGENT RESPONSE:");
    console.log("=".repeat(60));
    console.log(result2);

  } catch (error) {
    console.error("❌ Error during test:", error);
    process.exit(1);
  }
}

// Run the test
testAgent().catch(console.error);