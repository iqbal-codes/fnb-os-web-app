// Gemini AI Client utility
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';

// Initialize Gemini client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateGeminiAiContent: (content: string) => Promise<GenerateContentResponse> = (
  content: string,
) =>
  genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: content,
  });

/**
 * Generate text with Gemini
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await generateGeminiAiContent(prompt);
    return response.text || '';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

/**
 * Generate structured JSON response
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const result = await generateText(
    prompt + '\n\nRespond ONLY with valid JSON, no markdown or explanation.',
  );

  // Clean up response
  let cleaned = result.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return JSON.parse(cleaned.trim()) as T;
}

// Types for AI responses
export interface PriceSuggestion {
  suggested_price: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  market_range: {
    min: number;
    max: number;
  };
}

export interface BusinessAnalysis {
  health_score: number;
  issues: BusinessIssue[];
  recommendations: Recommendation[];
  summary: string;
}

export interface BusinessIssue {
  type: 'pricing' | 'cogs' | 'opex' | 'inventory' | 'sales';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
}

export interface Recommendation {
  priority: number;
  action: string;
  impact: string;
  category: string;
}
