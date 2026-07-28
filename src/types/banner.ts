export interface IBanner {
  _id: string;
  imageUrl: string;
  title: string;
  description?: string;
  linkType: 'audio' | 'category' | 'external';
  linkValue: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
