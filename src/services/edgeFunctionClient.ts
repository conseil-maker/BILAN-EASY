/**
 * Client pour appeler les Edge Functions Supabase
 * Remplace les appels directs aux API externes (Gemini, Resend)
 * Les clés API sont stockées côté serveur dans les secrets Supabase
 */

import { supabase } from '../lib/supabaseClient';

// URL de base des Edge Functions Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Appelle une Edge Function Supabase avec authentification
 */
async function callEdgeFunction<T>(functionName: string, payload: unknown): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Edge function error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// GEMINI API PROXY
// ============================================================================

export interface GeminiGenerateContentPayload {
  modelName?: string;
  systemInstruction?: string;
  contents: string | Array<{ role: string; parts: Array<{ text: string }> }>;
  generationConfig?: {
    responseMimeType?: string;
    responseSchema?: unknown;
    temperature?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiChatPayload {
  modelName?: string;
  systemInstruction?: string;
  history: Array<{ role: string; parts: Array<{ text: string }> }>;
  message: string;
  generationConfig?: {
    responseMimeType?: string;
    responseSchema?: unknown;
    temperature?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiResponse {
  text: string;
  candidates?: unknown[];
}

/**
 * Génère du contenu via l'API Gemini (proxy sécurisé)
 */
export async function geminiGenerateContent(payload: GeminiGenerateContentPayload): Promise<GeminiResponse> {
  return callEdgeFunction<GeminiResponse>('gemini-proxy', {
    action: 'generateContent',
    payload,
  });
}

/**
 * Génère du contenu en streaming via l'API Gemini (proxy sécurisé)
 */
export async function geminiGenerateContentStream(payload: GeminiGenerateContentPayload): Promise<GeminiResponse> {
  return callEdgeFunction<GeminiResponse>('gemini-proxy', {
    action: 'generateContentStream',
    payload,
  });
}

/**
 * Chat multi-tour via l'API Gemini (proxy sécurisé)
 */
export async function geminiChat(payload: GeminiChatPayload): Promise<GeminiResponse> {
  return callEdgeFunction<GeminiResponse>('gemini-proxy', {
    action: 'chat',
    payload,
  });
}

// ============================================================================
// EMAIL API PROXY
// ============================================================================

export interface EmailPayload {
  from?: string;
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

export interface EmailResponse {
  id: string;
}

/**
 * Envoie un email via l'API Resend (proxy sécurisé)
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResponse> {
  return callEdgeFunction<EmailResponse>('email-proxy', payload);
}

// ============================================================================
// FALLBACK: Mode développement local (si Edge Functions non déployées)
// ============================================================================

/**
 * Vérifie si les Edge Functions sont disponibles
 * Utile pour le développement local
 */
export async function checkEdgeFunctionsAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/gemini-proxy`, {
      method: 'OPTIONS',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Mode de fonctionnement actuel
 * - 'edge': Utilise les Edge Functions (production)
 * - 'direct': Utilise les API directement (développement local uniquement)
 */
export type ApiMode = 'edge' | 'direct';

let currentApiMode: ApiMode = 'edge';

export function setApiMode(mode: ApiMode): void {
  currentApiMode = mode;
  console.log(`[EdgeFunctionClient] API mode set to: ${mode}`);
}

export function getApiMode(): ApiMode {
  return currentApiMode;
}
