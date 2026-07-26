import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { connectDB } from './db.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';

// Setup upload folders (only in development or if writable)
const uploadDir = path.join(process.cwd(), 'uploads');
if (process.env.NODE_ENV !== 'production') {
  try {
    fs.mkdirSync(path.join(uploadDir, 'images'), { recursive: true });
    fs.mkdirSync(path.join(uploadDir, 'audio'), { recursive: true });
  } catch (err) {
    console.warn('Could not create local upload directories:', err);
  }
}

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kuku-fm-clone';

// Initialize Fastify
const fastify = Fastify({
  logger: true
});

// Configure CORS
fastify.register(cors, {
  origin: [
    process.env.WEBSITE_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Register Multipart for uploading files
fastify.register(multipart, {
  limits: {
    fieldNameSize: 100, // Max field name size in bytes
    fieldSize: 1000000, // Max field value size in bytes (1MB)
    fields: 10,         // Max number of non-file fields
    fileSize: 100 * 1024 * 1024, // For multipart forms, limit to 100MB
    files: 1            // Max number of file fields
  }
});

// Serve local uploads folder statically if it exists
if (fs.existsSync(uploadDir)) {
  fastify.register(fastifyStatic, {
    root: uploadDir,
    prefix: '/uploads/', // Serve from /uploads/ path
    decorateReply: false // Set to false to avoid collision with other static decorators
  });
} else {
  console.log('Skipping local static files serving (directory not found).');
}

// Status check route
fastify.get('/health', async () => {
  return { status: 'OK', message: 'Kuku FM Clone API Server is healthy' };
});

// Register routes
fastify.register(adminRoutes, { prefix: '/api/admin' });
fastify.register(publicRoutes, { prefix: '/api/public' });

// Bootstrap application
const start = async () => {
  try {
    await connectDB(MONGODB_URI);
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
