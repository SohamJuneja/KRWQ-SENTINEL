import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function check() {
  console.log("🔑 Checking API Key starting with:", process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 8) + "..." : "UNDEFINED");
  
  if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ ERROR: GOOGLE_API_KEY is missing from .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  console.log("📡 Connecting to Google AI...");
  
  try {
    // We try to list models instead of generating content first
    // This is the most basic test of connectivity
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, are you there?");
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ SUCCESS! The API Key is working.");
    console.log("🤖 Model replied:", text);
  } catch (error) {
    console.log("\n❌ DIAGNOSTIC FAILURE");
    console.log("---------------------");
    console.log("Error Message:", error.message);
    if (error.message.includes("404")) {
        console.log("Analysis: The endpoint URL is unreachable or the model name is wrong for this key type.");
    }
    if (error.message.includes("403")) {
        console.log("Analysis: The Key is valid but permission is denied (Billing? Region?).");
    }
  }
}

check();