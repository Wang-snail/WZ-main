import { GoogleGenAI } from "@google/genai";
import { ProfitResult, ProductInput, Language } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

// Extend ProductInput to accept a lang property dynamically if needed, 
// though typically strict typing would require updating the interface. 
// For now, we cast inside AIAdvisor or update type here.
interface AIInput extends ProductInput {
  lang?: Language;
}

export const analyzeProfitability = async (input: AIInput, result: ProfitResult): Promise<string> => {
  try {
    const ai = getClient();
    const langCode = input.lang || 'en';
    
    const prompt = `
    Act as an expert Amazon FBA business consultant. Analyze the following product profitability scenario and provide 3 strategic recommendations.
    
    **Language Instruction:**
    Please respond strictly in the language code: "${langCode}".
    
    **Product Data:**
    - Name: ${input.name}
    - Category: ${input.category}
    - Sell Price: $${input.price}
    - Product Cost (COGS): $${input.cost}
    - Size Tier: ${result.sizeTier}
    - Fee Period: ${input.feePeriod}
    
    **Financial Results:**
    - Total Amazon Fees: $${result.breakdown.totalFees.toFixed(2)}
    - Net Profit: $${result.netProfit.toFixed(2)}
    - Net Margin: ${result.margin.toFixed(1)}%
    - ROI: ${result.roi.toFixed(1)}%
    
    **Instructions:**
    1. Evaluate if this margin is healthy for the ${input.category} category.
    2. Suggest specific ways to reduce fees (e.g., packaging optimization if close to a size tier threshold).
    3. Provide a brief pricing strategy.
    
    Keep the output concise, formatted in Markdown, and under 250 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "AI Analysis service is currently unavailable. Please check your API key.";
  }
};