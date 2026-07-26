export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAudio {
  _id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  category: string; // Category ID or name? Standard: Reference to Category ID, or populate
  language: string;
  featured: boolean;
  trending: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBanner {
  _id: string;
  imageUrl: string;
  title: string;
  description?: string;
  linkType: 'audio' | 'category' | 'external';
  linkValue: string; // Slug or external URL
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISettings {
  _id?: string;
  appTitle: string;
  contactEmail: string;
  socialLinks: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  supportText?: string;
  updatedAt?: string;
}

export interface IAdmin {
  username: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
