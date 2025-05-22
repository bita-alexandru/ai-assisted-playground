import { GoogleGenAI } from "@google/genai";

// Fallback jokes in case the API call fails
const FALLBACK_JOKES = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
  "Why don't skeletons fight each other? They don't have the guts.",
  "I'm reading a book about anti-gravity. It's impossible to put down!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!"
];

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-2.0-flash';

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generate a joke using the Gemini API
 */
export const generateJoke = async (): Promise<string> => {
  // If no API key is provided, use a fallback joke
  if (!API_KEY) {
    console.warn('No Gemini API key provided. Using fallback jokes.');
    return getRandomFallbackJoke();
  }

  try {
    const prompt = `Generate a funny yet dark joke.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      generationConfig: {
        temperature: 0.9,
        topP: 1,
        topK: 1,
        maxOutputTokens: 100,
      },
    });

    const text = response.text?.trim();
    
    // Validate the response
    if (text && text.length > 0) {
      return text;
    }
    
    return getRandomFallbackJoke();
  } catch (error) {
    console.error('Error generating joke:', error);
    return getRandomFallbackJoke();
  }
};

/**
 * Get a random joke from the fallback list
 */
function getRandomFallbackJoke(): string {
  return FALLBACK_JOKES[Math.floor(Math.random() * FALLBACK_JOKES.length)];
}
