import { useState, useEffect } from 'react';
import { Joke, Dish } from './types';
import { generateJoke } from './services/jokeService';
import { generateDish } from './services/dishService';
import { FaStar, FaRegStar, FaStarHalfAlt, FaLaugh, FaUtensils } from 'react-icons/fa';

type ContentType = 'joke' | 'dish' | null;

function App() {
  const [currentContent, setCurrentContent] = useState<{type: ContentType, data: Joke | Dish | null}>({ 
    type: null, 
    data: null 
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ContentType>('joke');
  const [contentItems, setContentItems] = useState<Array<Joke | Dish>>(() => {
    // Load content from localStorage if available
    const savedContent = localStorage.getItem('contentItems');
    return savedContent ? JSON.parse(savedContent) : [];
  });

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('contentItems', JSON.stringify(contentItems));
  }, [contentItems]);

  const fetchContent = async (type: 'joke' | 'dish') => {
    if (!type) return;
    
    setIsLoading(true);
    try {
      if (type === 'joke') {
        const jokeText = await generateJoke();
        const newJoke: Joke = {
          id: Date.now().toString(),
          type: 'joke',
          content: jokeText,
          text: jokeText,
          title: 'New Joke',
          rating: null,
          timestamp: Date.now(),
          imageUrl: undefined
        };
        setCurrentContent({ type: 'joke', data: newJoke });
        setContentItems(prev => [newJoke, ...prev]);
      } else if (type === 'dish') {
        const dish = await generateDish();
        const newDish: Dish = {
          id: Date.now().toString(),
          type: 'dish',
          title: dish.title,
          content: dish.description,
          description: dish.description,
          imageUrl: dish.imageUrl,
          rating: null,
          timestamp: Date.now()
        };
        setCurrentContent({ type: 'dish', data: newDish });
        setContentItems(prev => [newDish, ...prev]);
      }
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      const errorMessage = `Oops! Couldn't fetch a ${type}. Try again later!`;
      setCurrentContent({ 
        type, 
        data: { 
          id: 'error', 
          type: type,
          title: 'Error', 
          content: errorMessage,
          description: errorMessage,
          timestamp: Date.now(),
          rating: null,
          imageUrl: ''
        } as Dish
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rateContent = (id: string, rating: number) => {
    setContentItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, rating } : item
      )
    );
    
    // Update current content if it's the one being rated
    if (currentContent.data?.id === id) {
      setCurrentContent(prev => ({
        ...prev,
        data: { ...prev.data!, rating }
      }));
    }
  };

  const renderRating = (item: Joke | Dish) => {
    if (item.rating === null) return null;
    
    const stars = [];
    const fullStars = Math.floor(item.rating);
    const hasHalfStar = item.rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar 
            key={i} 
            className="text-yellow-400 cursor-pointer" 
            onClick={() => rateContent(item.id, i)}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt 
            key={i} 
            className="text-yellow-400 cursor-pointer" 
            onClick={() => rateContent(item.id, i - 0.5)}
          />
        );
      } else {
        stars.push(
          <FaRegStar 
            key={i} 
            className="text-yellow-400 cursor-pointer" 
            onClick={() => rateContent(item.id, i)}
          />
        );
      }
    }
    
    return <div className="flex mt-2 gap-1">{stars}</div>;
  };
  
  const renderContentItem = (item: Joke | Dish) => (
    <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
      {item.type === 'dish' && 'imageUrl' in item && item.imageUrl && (
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947';
          }}
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
        <p className="text-gray-600 mt-2">
          {item.type === 'joke' ? (item as Joke).text : (item as Dish).description}
        </p>
        {renderRating(item)}
        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
          <span>{new Date(item.timestamp).toLocaleString()}</span>
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            {item.type === 'joke' ? 'Joke' : 'Dish'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white p-6 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold flex items-center">
              <FaLaugh className="mr-2" /> Content Generator
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                setActiveTab('joke');
                fetchContent('joke');
              }}
              disabled={isLoading && activeTab === 'joke'}
              className={`px-6 py-3 rounded-full font-semibold text-white transition-all duration-200 flex items-center ${
                isLoading && activeTab === 'joke'
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-500 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              <FaLaugh className="mr-2" />
              {isLoading && activeTab === 'joke' ? 'Loading...' : 'Tell me a joke'}
            </button>
            
            <button
              onClick={() => {
                setActiveTab('dish');
                fetchContent('dish');
              }}
              disabled={isLoading && activeTab === 'dish'}
              className={`px-6 py-3 rounded-full font-semibold text-white transition-all duration-200 flex items-center ${
                isLoading && activeTab === 'dish'
                  ? 'bg-pink-400 cursor-not-allowed' 
                  : 'bg-pink-500 hover:bg-pink-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              <FaUtensils className="mr-2" />
              {isLoading && activeTab === 'dish' ? 'Cooking...' : 'Show me something delicious!'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {activeTab === 'joke' 
                    ? 'Thinking of a funny joke...' 
                    : 'Cooking up something delicious...'}
                </p>
              </div>
            ) : currentContent.data ? (
              <div>
                {currentContent.type === 'dish' && 'imageUrl' in currentContent.data && currentContent.data.imageUrl && (
                  <img 
                    src={currentContent.data.imageUrl} 
                    alt={currentContent.data.title} 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947';
                    }}
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                    {currentContent.data.title || 
                      (currentContent.type === 'joke' ? 'Latest Joke' : 'Delicious Dish')}
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    {currentContent.type === 'joke' 
                      ? (currentContent.data as Joke).text 
                      : (currentContent.data as Dish).description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => rateContent(currentContent.data!.id, star)}
                          className="text-2xl transition-transform hover:scale-110"
                          disabled={isLoading}
                        >
                          {currentContent.data!.rating && star <= currentContent.data!.rating ? (
                            <FaStar className="text-yellow-400" />
                          ) : (
                            <FaRegStar className="text-yellow-400 opacity-70 hover:opacity-100" />
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => fetchContent(activeTab as 'joke' | 'dish')}
                      className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors"
                      disabled={isLoading}
                    >
                      {activeTab === 'joke' ? 'Another one!' : 'Try another dish'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4 text-gray-300">
                  {activeTab === 'joke' ? <FaLaugh /> : <FaUtensils />}
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  {activeTab === 'joke' 
                    ? 'No joke generated yet' 
                    : 'No dish generated yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  Click the button above to generate {activeTab === 'joke' ? 'a joke' : 'a delicious dish'}!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="lg:col-span-1">
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'joke' 
                  ? 'border-b-2 border-indigo-500 text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('joke')}
            >
              Jokes
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'dish' 
                  ? 'border-b-2 border-pink-500 text-pink-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('dish')}
            >
              Dishes
            </button>
          </div>
          
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Your {activeTab === 'joke' ? 'Jokes' : 'Dishes'}
          </h2>
          
          {contentItems.filter(item => item.type === activeTab).length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {contentItems
                .filter(item => item.type === activeTab)
                .map(item => renderContentItem(item))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-gray-500">
                No {activeTab === 'joke' ? 'jokes' : 'dishes'} yet. Generate some to see them here!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
