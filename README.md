# Joke Teller App

A fun and interactive web application that tells jokes using the Google Gemini API. Users can request jokes, rate them, and view their joke history.

## Features

- Get random jokes with a single click
- Rate jokes on a 5-star scale
- View joke history with timestamps
- Responsive design that works on all devices
- Jokes are saved in the browser's local storage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key (optional - fallback jokes are provided)

### Installation

1. Clone the repository or download the source code
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Google Gemini API key:
   - Get an API key from [Google AI Studio](https://makersuite.google.com/)
   - Replace `YOUR_API_KEY_HERE` in `src/services/jokeService.ts` with your actual API key

### Running the App

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

## How to Use

1. Click the "Tell me a joke" button to get a random joke
2. The joke will appear in the main area
3. Rate the joke using the 1-5 star rating system
4. View your joke history in the right sidebar
5. Click "Tell me another joke" to get more jokes

## Technologies Used

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Google Gemini API for joke generation
- React Icons for icons
- LocalStorage for persisting jokes between sessions

## License

This project is open source and available under the [MIT License](LICENSE).
