export interface IAudio {
  _id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  category: string;
  language?: string;
  featured: boolean;
  trending: boolean;
  published: boolean;
  lyrics?: string;
  createdAt: string;
  updatedAt: string;
}
