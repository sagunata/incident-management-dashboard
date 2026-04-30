import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function generateWithRetry(model: any, prompt: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error: any) {
      const isOverloaded = error.message?.includes("503") || error.message?.includes("high demand") || error.status === 503;
      
      if (isOverloaded && attempt < maxRetries) {
        console.warn(`[AI API] Google sunucuları meşgul (Deneme ${attempt}/${maxRetries}). 2 saniye bekleniyor...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw error; 
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, title, description } = body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    if (action === "classify") {
      const prompt = `
You are a senior IT support specialist. Analyze the following incident title and description.
Title: "${title}"
Description: "${description}"

Return ONLY a valid JSON object. Do not write any other text or explanation.
The format must be exactly as follows:
{
  "severity": "ONE of the following values: 'low', 'medium', 'high', or 'critical' (estimate based on urgency)",
  "service": "The name of the affected service. E.g., 'Database', 'Payment Gateway', 'Auth System', etc. Keep it short."
}
`;

      const result = await generateWithRetry(model, prompt);
      const cleanJson = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    if (action === "summarize") {
      const prompt = `
        Task: Act as an Executive Technical Lead. Summarize the following incident description into a single, high-level technical sentence.
        
        Rules:
        1. Maximum 25 words.
        2. Focus strictly on the "Root Cause" and "Immediate Impact".
        3. No introductory phrases like "The issue is..." or "Based on the logs...".
        4. Use professional, concise engineering language.

        Incident Description: "${description}"
      `;
      
      const result = await generateWithRetry(model, prompt);
      return NextResponse.json({ summary: result.response.text().trim() });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    console.error("AI API Error:", error);
    
    if (error.message?.includes("503") || error.message?.includes("high demand")) {
      return NextResponse.json({ error: "Google servers are currently overloaded. Please try again in a minute." }, { status: 503 });
    }
    
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}