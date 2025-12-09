import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
// We hit the generic "list models" endpoint directly
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("🔍 Asking Google for the list of available models...");

try {
    const response = await fetch(URL);
    const data = await response.json();

    if (data.error) {
        console.error("❌ API Error:", data.error.message);
        console.error("Code:", data.error.code);
        console.error("Status:", data.error.status);
    } else {
        console.log("✅ Success! Here are the models your key can see:");
        if (data.models && data.models.length > 0) {
            data.models.forEach(m => {
                // Only showing generateContent models to keep it clean
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(` - ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("⚠️ The request succeeded, but the list is EMPTY.");
            console.log("This usually means the 'Generative Language API' is not enabled in your Google Cloud Console.");
        }
    }
} catch (error) {
    console.error("❌ Network Error:", error.message);
}