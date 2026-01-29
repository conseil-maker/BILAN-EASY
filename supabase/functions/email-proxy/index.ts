// Edge Function: email-proxy
// Proxy sécurisé pour les appels à l'API Resend
// La clé API est stockée dans les secrets Supabase, jamais exposée côté client

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_URL = "https://api.resend.com/emails";

interface EmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Récupérer la clé API depuis les secrets Supabase
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Parser le body de la requête
    const emailPayload: EmailPayload = await req.json();

    // Valider les champs requis
    if (!emailPayload.to || !emailPayload.subject) {
      throw new Error("Missing required fields: to, subject");
    }

    // Définir l'expéditeur par défaut si non fourni
    if (!emailPayload.from) {
      emailPayload.from = Deno.env.get("EMAIL_FROM") || "contact@netzinformatique.fr";
    }

    // Appeler l'API Resend
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(result)}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Email proxy error:", error);
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
