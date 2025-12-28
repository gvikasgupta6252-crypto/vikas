
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartProductRecommendations = async (query: string, products: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is searching for: "${query}". Based on the following inventory, suggest the top 3 most relevant products. Return only the product IDs as a JSON array.
      Inventory: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, brand: p.brand })))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const generateProductDescription = async (name: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, professional, and appetizing 20-word product description for ${name} in the ${category} category for an Indian grocery store.`,
    });
    return response.text;
  } catch (error) {
    return "Fresh and high-quality product for your daily needs.";
  }
};
