import mongoose, { Schema, Document } from 'mongoose';

// Category Schema
export interface ICategoryDoc extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDoc>({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String }
}, { timestamps: true });

export const CategoryModel = mongoose.model<ICategoryDoc>('Category', CategorySchema);

// Audio Schema
export interface IAudioDoc extends Document {
  title: string;
  description: string;
  slug: string;
  thumbnailUrl: string;
  audioUrl: string;
  duration: number;
  category: mongoose.Types.ObjectId;
  language: string;
  featured: boolean;
  trending: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AudioSchema = new Schema<IAudioDoc>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  thumbnailUrl: { type: String, required: true },
  audioUrl: { type: String, required: true },
  duration: { type: Number, required: true, default: 0 },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  language: { type: String, required: true, index: true },
  featured: { type: Boolean, default: false, index: true },
  trending: { type: Boolean, default: false, index: true },
  published: { type: Boolean, default: true, index: true }
}, { timestamps: true });

// Multi-key/Text indexes for fast searching and filtering
AudioSchema.index({ title: 'text', description: 'text' }, { language_override: 'none' });
// Compounding indexes for category + published and language + published
AudioSchema.index({ category: 1, published: 1 });
AudioSchema.index({ featured: 1, published: 1 });
AudioSchema.index({ trending: 1, published: 1 });
AudioSchema.index({ createdAt: -1, published: 1 });

export const AudioModel = mongoose.model<IAudioDoc>('Audio', AudioSchema);

// Banner Schema
export interface IBannerDoc extends Document {
  imageUrl: string;
  title: string;
  description?: string;
  linkType: 'audio' | 'category' | 'external';
  linkValue: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBannerDoc>({
  imageUrl: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  linkType: { type: String, enum: ['audio', 'category', 'external'], required: true },
  linkValue: { type: String, required: true },
  published: { type: Boolean, default: true, index: true }
}, { timestamps: true });

export const BannerModel = mongoose.model<IBannerDoc>('Banner', BannerSchema);

// Settings Schema
export interface ISettingsDoc extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettingsDoc>({
  appTitle: { type: String, default: 'StoryBox' },
  contactEmail: { type: String, default: 'support@storybox.com' },
  socialLinks: {
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  supportText: { type: String, default: '' }
}, { timestamps: true });

export const SettingsModel = mongoose.model<ISettingsDoc>('Settings', SettingsSchema);
