/**
 * Tests pour les utilitaires Gemini
 */

import { describe, it, expect, vi } from 'vitest';
import { 
  parseJsonResponse, 
  formatConversationHistory, 
  extractThemes,
  calculateProgress,
  sanitizeUserInput 
} from './utils';

describe('parseJsonResponse', () => {
  it('devrait parser une réponse JSON valide', () => {
    const jsonString = '{"question": "Test?", "category": "parcours"}';
    const result = parseJsonResponse(jsonString);
    expect(result).toEqual({ question: 'Test?', category: 'parcours' });
  });

  it('devrait extraire le JSON d\'un texte avec markdown', () => {
    const markdownString = '```json\n{"question": "Test?"}\n```';
    const result = parseJsonResponse(markdownString);
    expect(result).toEqual({ question: 'Test?' });
  });

  it('devrait retourner null pour un JSON invalide', () => {
    const invalidJson = 'not a json';
    const result = parseJsonResponse(invalidJson);
    expect(result).toBeNull();
  });

  it('devrait gérer les chaînes vides', () => {
    const result = parseJsonResponse('');
    expect(result).toBeNull();
  });
});

describe('formatConversationHistory', () => {
  it('devrait formater correctement l\'historique de conversation', () => {
    const messages = [
      { role: 'assistant' as const, content: 'Question 1?' },
      { role: 'user' as const, content: 'Réponse 1' },
      { role: 'assistant' as const, content: 'Question 2?' },
    ];
    
    const result = formatConversationHistory(messages);
    
    expect(result).toContain('Question 1?');
    expect(result).toContain('Réponse 1');
    expect(result).toContain('Question 2?');
  });

  it('devrait gérer un historique vide', () => {
    const result = formatConversationHistory([]);
    expect(result).toBe('');
  });
});

describe('extractThemes', () => {
  it('devrait extraire les thèmes des réponses', () => {
    const answers = [
      { questionId: '1', text: 'Je travaille dans le développement web depuis 10 ans', category: 'parcours' },
      { questionId: '2', text: 'J\'aime la créativité et l\'innovation', category: 'motivations' },
    ];
    
    const result = extractThemes(answers);
    
    expect(Array.isArray(result)).toBe(true);
  });

  it('devrait gérer un tableau de réponses vide', () => {
    const result = extractThemes([]);
    expect(result).toEqual([]);
  });
});

describe('calculateProgress', () => {
  it('devrait calculer le pourcentage de progression', () => {
    const result = calculateProgress(10, 40);
    expect(result).toBe(25);
  });

  it('devrait retourner 0 si le total est 0', () => {
    const result = calculateProgress(5, 0);
    expect(result).toBe(0);
  });

  it('devrait plafonner à 100%', () => {
    const result = calculateProgress(50, 40);
    expect(result).toBe(100);
  });

  it('devrait arrondir à l\'entier le plus proche', () => {
    const result = calculateProgress(1, 3);
    expect(result).toBe(33);
  });
});

describe('sanitizeUserInput', () => {
  it('devrait supprimer les balises HTML', () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeUserInput(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('Hello');
  });

  it('devrait trimmer les espaces', () => {
    const input = '   Hello World   ';
    const result = sanitizeUserInput(input);
    expect(result).toBe('Hello World');
  });

  it('devrait gérer les chaînes vides', () => {
    const result = sanitizeUserInput('');
    expect(result).toBe('');
  });

  it('devrait limiter la longueur du texte', () => {
    const longInput = 'a'.repeat(10000);
    const result = sanitizeUserInput(longInput, 100);
    expect(result.length).toBeLessThanOrEqual(100);
  });
});
