
import { GoogleGenAI } from "@google/genai";

export async function getNomadInsight(country: string): Promise<string> {
  // Always use process.env.API_KEY directly when initializing the client.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Forneça um insight curto (máx 200 caracteres) e motivacional para um nômade digital brasileiro que está indo para a Espanha. Fale especificamente sobre a vida na Espanha (comida, siesta, digital nomad visa ou clima). Use um tom de consultor premium.`,
    });
    // The response object features a .text property which directly returns the string.
    return response.text || "A Espanha te espera com tapas e sol. Continue focado nos seus documentos!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lembre-se: o segredo do visto espanhol está no detalhe dos extratos bancários.";
  }
}
