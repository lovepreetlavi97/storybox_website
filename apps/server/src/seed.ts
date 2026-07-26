import 'dotenv/config';
import mongoose from 'mongoose';
import { CategoryModel, AudioModel, BannerModel, SettingsModel } from './models.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lvprimex:Lovepreet697@cluster0.ozxwm1u.mongodb.net/storybox?appName=Cluster0';

async function seed() {
  console.log('Connecting to database for seeding...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
    console.log('Successfully connected to Configured MongoDB Atlas Database');
  } catch (err: any) {
    console.warn(`Connection to Atlas database failed: ${err.message}. Falling back to local MongoDB...`);
    await mongoose.connect('mongodb://localhost:27017/storybox', { serverSelectionTimeoutMS: 2000 });
    console.log('Successfully connected to local fallback database for seeding.');
  }
  console.log('Connected to DB. Dropping old collections to rebuild indexes...');
  try { await CategoryModel.collection.drop(); } catch (e) {}
  try { await AudioModel.collection.drop(); } catch (e) {}
  try { await BannerModel.collection.drop(); } catch (e) {}
  try { await SettingsModel.collection.drop(); } catch (e) {}

  console.log('Collections cleared. Inserting categories...');
  const catSelfHelp = await new CategoryModel({
    name: 'Self Help & Mindset',
    slug: 'self-help-mindset',
    description: 'Futuristic ideas on self-development, productivity, and biohacking.'
  }).save();

  const catFinance = await new CategoryModel({
    name: 'Wealth & Personal Finance',
    slug: 'wealth-finance',
    description: 'Strategies for monetary sovereignty, digital assets, and wealth creation.'
  }).save();

  const catSciFi = await new CategoryModel({
    name: 'Sci-Fi & Cyberpunk Stories',
    slug: 'scifi-cyberpunk',
    description: 'Immersive stories from futuristic cities, deep space, and cybernetics.'
  }).save();

  console.log('Categories created. Inserting audios...');
  const audios = [
    {
      title: 'Think and Grow Rich (Audio Summary)',
      description: 'The futuristic adaptation of Napoleon Hill\'s classic mindset guide, tailored for building digital-age wealth and focus.',
      slug: 'think-and-grow-rich-summary',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 372, // 6:12
      category: catFinance._id,
      language: 'English',
      featured: true,
      trending: true,
      published: true
    },
    {
      title: 'Atomic Habits (Space Exploration Edition)',
      description: 'How small systems lead to exponential growth, told through the story of a spacecraft navigator configuring automated systems.',
      slug: 'atomic-habits-space-edition',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 423, // 7:03
      category: catSelfHelp._id,
      language: 'English',
      featured: true,
      trending: false,
      published: true
    },
    {
      title: 'Neon Dreams: Cyberpunk Chronicles',
      description: 'A neon-drenched narrative exploring the streets of a future metropolis where humans co-exist with digital neural systems.',
      slug: 'neon-dreams-cyberpunk-chronicles',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=1200',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      duration: 302, // 5:02
      category: catSciFi._id,
      language: 'English',
      featured: false,
      trending: true,
      published: true
    },
    {
      title: 'The Psychology of Money (Audio Summary)',
      description: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. Learn to master your cyber wealth psychology.',
      slug: 'psychology-of-money-audiobook',
      thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      duration: 502, // 8:22
      category: catFinance._id,
      language: 'English',
      featured: false,
      trending: true,
      published: true
    }
  ];

  await AudioModel.insertMany(audios);
  console.log('Audios created. Inserting banners...');

  const banners = [
    {
      title: 'Listen to Atomic Habits (Special Edition)',
      description: 'Discover how small daily adjustments lead to huge long-term results. Stream the sci-fi adaptation summary.',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3000', // 4K Space Galaxy!
      linkType: 'audio',
      linkValue: 'atomic-habits-space-edition',
      published: true
    },
    {
      title: 'Futuristic Wealth Creation Guides',
      description: 'Explore our personal finance audiobook category. Learn strategies to optimize capital and digital assets.',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=3000', // 4K Skyline
      linkType: 'category',
      linkValue: 'wealth-finance',
      published: true
    },
    {
      title: 'Discover Cyberpunk Stories',
      description: 'Immerse yourself in neon-drenched Sci-Fi chronicles. Stream full chapters on the sticky bottom player.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3000', // 4K Abstract
      linkType: 'category',
      linkValue: 'scifi-cyberpunk',
      published: true
    }
  ];

  await BannerModel.insertMany(banners);

  console.log('Inserting initial Settings...');
  await new SettingsModel({
    appTitle: 'StoryBox',
    contactEmail: 'support@storybox.com',
    socialLinks: {
      facebook: 'https://facebook.com/storybox',
      youtube: 'https://youtube.com/storybox',
      instagram: 'https://instagram.com/storybox',
      twitter: 'https://twitter.com/storybox',
      linkedin: 'https://linkedin.com/company/storybox'
    },
    supportText: 'StoryBox is a futuristic, lightweight, high-performance audio streaming platform. Designed for immersive story discovery.'
  }).save();

  console.log('Database seeding successfully finished!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Error during database seed:', err);
  process.exit(1);
});
