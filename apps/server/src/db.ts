import mongoose from 'mongoose';

export async function connectDB(uri: string) {
  try {
    // Hide credentials in logs
    const safeUri = uri.includes('@') ? uri.split('@').pop() : uri;
    console.log(`Attempting database connection to: ${safeUri}...`);
    
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('Successfully connected to MongoDB Database');
  } catch (error: any) {
    console.warn(`Connection to configured MongoDB URI failed: ${error.message || error}`);
    const localFallback = 'mongodb://localhost:27017/storybox';
    console.log(`Attempting local fallback connection: ${localFallback}...`);
    try {
      await mongoose.connect(localFallback, { serverSelectionTimeoutMS: 2000 });
      console.log('Successfully connected to local fallback MongoDB');
    } catch (fallbackError) {
      console.error('Database connection failed entirely. Both Atlas and fallback local MongoDB are unreachable.');
      process.exit(1);
    }
  }
}
