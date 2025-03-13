import { customProvider, wrapLanguageModel } from 'ai';
import { openai } from '@ai-sdk/openai';
import { fireworks } from '@ai-sdk/fireworks';
import { isTestEnvironment } from '../constants';
import { chatModels } from './models';
import { GenerativeAI } from '@google/generative-ai';

const gemini = new GenerativeAI({
  apiKey: process.env.GEMINI_API_KEY, // Replace with your actual API key
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        ...chatModels.reduce((acc, model) => ({...acc, [model.id]: model}), {}),
      },
    })
  : customProvider({
      languageModels: {
        ...chatModels.reduce((acc, model) => ({...acc, [model.id]: model}), {}),
        'gemini-model': wrapLanguageModel({
          model: {
            generateText: async (prompt: string) => {
              try {
                const response = await gemini.generateText({
                  model: 'models/gemini-pro', // Or another suitable Gemini model
                  prompt,
                });
                return response.candidates[0].output;
              } catch (error) {
                console.error('Gemini API error:', error);
                throw error; // Re-throw for handling in higher layers
              }
            },
          },
        }),
      },
      imageModels: {
        'small-model': openai.image('dall-e-2'),
        'large-model': openai.image('dall-e-3'),
      },
    });
