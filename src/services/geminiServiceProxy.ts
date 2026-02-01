/**
 * Proxy pour geminiService qui utilise les Edge Functions Supabase
 * Ce fichier remplace les appels directs à l'API Gemini par des appels sécurisés
 * via les Edge Functions, où les clés API sont stockées côté serveur.
 * 
 * MIGRATION EN COURS:
 * 1. Ce fichier fournit une interface compatible avec l'ancien geminiService
 * 2. Les fonctions sont progressivement migrées pour utiliser edgeFunctionClient
 * 3. Une fois la migration complète, ce fichier remplacera geminiService.ts
 */

import { supabase } from '../lib/supabaseClient';

// URL de base des Edge Functions Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Appelle l'Edge Function gemini-proxy pour générer du contenu
 * Compatible avec l'interface de l'ancien GoogleGenAI
 */
export async function generateContentViaProxy(
  prompt: string,
  config: {
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: unknown;
    temperature?: number;
    maxOutputTokens?: number;
    model?: string;
  } = {}
): Promise<{ text: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const payload = {
    action: 'generateContent',
    payload: {
      modelName: config.model || 'gemini-2.0-flash',
      systemInstruction: config.systemInstruction,
      contents: prompt,
      generationConfig: {
        responseMimeType: config.responseMimeType,
        responseSchema: config.responseSchema,
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      },
    },
  };

  // Créer un AbortController avec timeout de 60s pour les appels IA longs
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${FUNCTIONS_URL}/gemini-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Gemini proxy error: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout de 60s dépassé pour la génération de question');
    }
    throw error;
  }
}

/**
 * Wrapper qui simule l'interface de GoogleGenAI pour une migration progressive
 * Permet de remplacer `ai.models.generateContent()` par `geminiProxy.generateContent()`
 */
export const geminiProxy = {
  models: {
    generateContent: async (options: {
      model: string;
      contents: string;
      config?: {
        systemInstruction?: string;
        responseMimeType?: string;
        responseSchema?: unknown;
        tools?: unknown[];
      };
    }) => {
      const result = await generateContentViaProxy(options.contents, {
        model: options.model,
        systemInstruction: options.config?.systemInstruction,
        responseMimeType: options.config?.responseMimeType,
        responseSchema: options.config?.responseSchema,
      });
      
      return {
        text: result.text,
        response: {
          text: () => result.text,
        },
      };
    },
  },
};

/**
 * Vérifie si l'Edge Function est disponible
 * Retourne true si l'Edge Function répond, false sinon
 */
export async function isGeminiProxyAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/gemini-proxy`, {
      method: 'OPTIONS',
    });
    return response.ok;
  } catch {
    console.warn('[GeminiProxy] Edge Function not available, will use direct API');
    return false;
  }
}
