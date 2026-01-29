// Edge Function: gemini-proxy
// Proxy sécurisé pour les appels à l'API Google Gemini
// La clé API est stockée dans les secrets Supabase, jamais exposée côté client

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Récupérer la clé API depuis les secrets Supabase
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Parser le body de la requête
    const { action, payload } = await req.json();

    // Initialiser le client Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    let result;

    switch (action) {
      case "generateContent": {
        // Génération de contenu (questions, synthèses, etc.)
        const { modelName, systemInstruction, contents, generationConfig } = payload;
        
        const model = genAI.getGenerativeModel({
          model: modelName || "gemini-1.5-flash",
          systemInstruction: systemInstruction,
          generationConfig: generationConfig,
        });

        const response = await model.generateContent(contents);
        result = {
          text: response.response.text(),
          candidates: response.response.candidates,
        };
        break;
      }

      case "generateContentStream": {
        // Génération en streaming (pour les réponses longues)
        const { modelName, systemInstruction, contents, generationConfig } = payload;
        
        const model = genAI.getGenerativeModel({
          model: modelName || "gemini-1.5-flash",
          systemInstruction: systemInstruction,
          generationConfig: generationConfig,
        });

        const response = await model.generateContentStream(contents);
        let fullText = "";
        for await (const chunk of response.stream) {
          fullText += chunk.text();
        }
        result = { text: fullText };
        break;
      }

      case "chat": {
        // Chat multi-tour
        const { modelName, systemInstruction, history, message, generationConfig } = payload;
        
        const model = genAI.getGenerativeModel({
          model: modelName || "gemini-1.5-flash",
          systemInstruction: systemInstruction,
          generationConfig: generationConfig,
        });

        const chat = model.startChat({ history });
        const response = await chat.sendMessage(message);
        result = {
          text: response.response.text(),
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Gemini proxy error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
