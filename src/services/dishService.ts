import { GoogleGenerativeAI } from "@google/generative-ai";

// Fallback dishes in case the API call fails
const FALLBACK_DISHES = [
  {
    title: "Spaghetti Carbonara",
    description: "Creamy pasta with crispy pancetta, eggs, and pecorino cheese.",
    imageUrl: "https://source.unsplash.com/random/600x400/?spaghetti,carbonara"
  },
  {
    title: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey, molten center, served with vanilla ice cream.",
    imageUrl: "https://source.unsplash.com/random/600x400/?chocolate,lava,cake"
  },
  {
    title: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, fresh mozzarella, and basil leaves.",
    imageUrl: "https://source.unsplash.com/random/600x400/?pizza,margherita"
  }
];

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-1.5-flash';

// Initialize the Google GenAI client
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate a unique image URL based on the dish details
 */
function generateImageUrl(dishData: { title: string; description: string; }): string {
  try {
    // Create a more specific search query with multiple keywords
    const keywords = [
      dishData.title.toLowerCase(),
      ...dishData.description.toLowerCase().split(' ').slice(0, 5)
    ].filter(Boolean).join(',');
    
    // Add a random parameter to ensure we get a different image each time
    const randomParam = Date.now();
    
    return `https://source.unsplash.com/random/600x400/?${keywords},food,${randomParam}`;
  } catch (error) {
    console.error('Error generating image URL:', error);
    // Fallback to a random food image
    return `https://source.unsplash.com/random/600x400/?food,${Date.now()}`;
  }
}

/**
 * Generate a delicious dish using the Gemini API
 */
export const generateDish = async (): Promise<{ title: string; description: string; imageUrl: string }> => {
  // If no API key is provided, use a fallback dish
  if (!API_KEY) {
    console.warn('No Gemini API key provided. Using fallback dishes.');
    return getRandomFallbackDish();
  }

  try {
    // Add some randomness to the prompt to get different results
    const cuisines = ['Italian', 'Mexican', 'Japanese', 'Indian', 'Thai', 'French', 'Mediterranean', 'Chinese', 'American', 'Greek'];
    const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    const mealTypes = ['appetizer', 'main course', 'dessert', 'salad', 'soup', 'side dish'];
    const randomMealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
    
    // Add more specific instructions to get varied results
    const prompt = `Generate a unique and creative ${randomCuisine} ${randomMealType} dish. 
    Be very specific with ingredients and preparation. 
    Include at least 3 specific ingredients and a unique cooking method.
    Format your response as valid JSON with these exact field names:
    {
      "title": "Creative dish name (be specific and descriptive)",
      "description": "Detailed description including key ingredients and preparation method. Make it sound delicious and unique.",
      "imagePrompt": "A short description of how the dish should look"
    }`;

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 1.2,  // Increased for more creativity
        topP: 0.9,       // Slightly lower for more focused but still varied results
        topK: 40,        // Slight adjustment for better variety
        maxOutputTokens: 1024,
      },
    });
    
    // Generate the dish details
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    let dishData;
    try {
      // Clean up the response and extract JSON
      const cleanedText = text.trim()
        .replace(/^```json\n?/, '')
        .replace(/\n```$/, '')
        .trim();
      dishData = JSON.parse(cleanedText);
      
      // Validate the response structure
      if (!dishData.title || !dishData.description) {
        throw new Error('Invalid dish data format');
      }
    } catch (e) {
      console.error('Failed to parse dish data:', e);
      console.log('Raw response:', text);
      return getRandomFallbackDish();
    }

    // Generate a unique image URL based on the dish details
    const imageUrl = generateImageUrl(dishData);

    return {
      title: dishData.title || 'Delicious Dish',
      description: dishData.description || 'A delicious dish',
      imageUrl
    };
  } catch (error) {
    console.error('Error generating dish:', error);
    return getRandomFallbackDish();
  }
};

/**
 * Get a random dish from the fallback list
 */
const getRandomFallbackDish = () => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_DISHES.length);
  return FALLBACK_DISHES[randomIndex];
};
