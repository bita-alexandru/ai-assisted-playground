export interface ContentItem {
  id: string;
  type: 'joke' | 'dish';
  title: string;
  content: string;
  imageUrl?: string;
  rating: number | null;
  timestamp: number;
}

export interface Joke extends Omit<ContentItem, 'type'> {
  type: 'joke';
  text: string;
  title: string;
}

export interface Dish extends Omit<ContentItem, 'type' | 'text'> {
  type: 'dish';
  description: string;
  imageUrl: string;
}
