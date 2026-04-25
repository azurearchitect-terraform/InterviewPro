/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

export function getGemini(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export async function callGemini(
  apiKey: string, 
  prompt: string, 
  systemInstruction: string = '', 
  model: string = 'gemini-3-flash-preview'
) {
  const ai = getGemini(apiKey);
  
  const modelMap: Record<string, string> = {
    'gemini-1.5-flash': 'gemini-3-flash-preview',
    'gemini-1.5-pro': 'gemini-3.1-pro-preview',
    'gemini-2.0-flash': 'gemini-3-flash-preview',
    'gemini-2.0-pro': 'gemini-3.1-pro-preview',
    'gemini-3.1-pro-preview': 'gemini-3.1-pro-preview',
    'gemini-3.1-flash-preview': 'gemini-3-flash-preview',
    'gemini-3.1-flash': 'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview': 'gemini-3.1-flash-lite-preview',
    'gemini-3.1-flash-lite': 'gemini-3.1-flash-lite-preview',
  };

  const actualModel = modelMap[model] || model;

  try {
    const response = await ai.models.generateContent({
      model: actualModel,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature: 0.8,
      }
    });

    return response.text || '';
  } catch (error) {
    console.warn(`Model ${actualModel} failed, falling back to gemini-3-flash-preview`, error);
    if (actualModel !== 'gemini-3-flash-preview') {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: 0.8,
        }
      });
      return fallbackResponse.text || '';
    }
    throw error;
  }
}
