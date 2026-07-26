import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { CategoryModel, AudioModel, BannerModel, SettingsModel } from '../models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtsecretkey';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

async function uploadToS3(fileStream: any, filename: string, mimeType: string): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET || 'storybox-audio-uploads';
  const key = `uploads/${mimeType.startsWith('audio/') ? 'audio' : 'images'}/${filename}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: mimeType,
    }
  });

  await upload.done();
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

async function handleFileUpload(fileData: any, subfolder: string): Promise<string> {
  const ext = path.extname(fileData.filename).toLowerCase();
  const uniqueFilename = `${crypto.randomUUID()}${ext}`;

  if (process.env.NODE_ENV === 'production') {
    return await uploadToS3(fileData.file, uniqueFilename, fileData.mimetype);
  } else {
    const uploadDir = path.join(process.cwd(), 'uploads', subfolder);
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueFilename);
    await pipeline(fileData.file, fs.createWriteStream(filePath));
    return `/uploads/${subfolder}/${uniqueFilename}`;
  }
}

// Simple token utility
export function verifyToken(authHeader?: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return false;
    const payload = Buffer.from(payloadBase64, 'base64').toString();
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return false;
    
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

// Authentication hook
async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const isAuthorized = verifyToken(request.headers.authorization);
  if (!isAuthorized) {
    reply.status(401).send({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
}

export default async function adminRoutes(fastify: FastifyInstance) {
  // Login Endpoint
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, password } = request.body as any;
    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'adminpassword';

    if (username === expectedUser && password === expectedPass) {
      const payload = JSON.stringify({ username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }); // 7 days expiration
      const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
      const token = Buffer.from(payload).toString('base64') + '.' + signature;
      
      return { success: true, data: { token, username } };
    } else {
      reply.status(400).send({ success: false, error: 'Invalid username or password' });
    }
  });

  // Apply authorization to all routes below this point
  fastify.addHook('preHandler', authenticate);

  // Dashboard Stats
  fastify.get('/dashboard', async () => {
    const [totalAudios, totalCategories, totalBanners] = await Promise.all([
      AudioModel.countDocuments(),
      CategoryModel.countDocuments(),
      BannerModel.countDocuments()
    ]);

    const latestAudios = await AudioModel.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      success: true,
      data: {
        totalAudios,
        totalCategories,
        totalBanners,
        latestAudios
      }
    };
  });

  // UPLOAD IMAGES
  fastify.post('/upload/image', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ success: false, error: 'No file uploaded' });
    }

    try {
      const url = await handleFileUpload(data, 'images');
      return {
        success: true,
        data: { url }
      };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: `Image upload failed: ${err.message || err}` });
    }
  });

  // UPLOAD AUDIO
  fastify.post('/upload/audio', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ success: false, error: 'No file uploaded' });
    }

    const ext = path.extname(data.filename).toLowerCase();
    if (ext !== '.mp3' && ext !== '.m4a' && ext !== '.wav' && ext !== '.ogg') {
      return reply.status(400).send({ success: false, error: 'Only audio files (mp3, m4a, wav, ogg) are supported' });
    }

    try {
      const url = await handleFileUpload(data, 'audio');
      return {
        success: true,
        data: { url }
      };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: `Audio upload failed: ${err.message || err}` });
    }
  });

  // CATEGORIES CRUD
  fastify.get('/categories', async () => {
    const categories = await CategoryModel.find().sort({ name: 1 });
    return { success: true, data: categories };
  });

  fastify.post('/categories', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, slug, description } = request.body as any;
    if (!name || !slug) {
      return reply.status(400).send({ success: false, error: 'Name and slug are required' });
    }

    try {
      const category = new CategoryModel({ name, slug, description });
      await category.save();
      return { success: true, data: category };
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message || 'Error creating category' });
    }
  });

  fastify.put('/categories/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    const { name, slug, description } = request.body as any;

    try {
      const category = await CategoryModel.findByIdAndUpdate(
        id,
        { name, slug, description },
        { new: true, runValidators: true }
      );
      if (!category) {
        return reply.status(404).send({ success: false, error: 'Category not found' });
      }
      return { success: true, data: category };
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message || 'Error updating category' });
    }
  });

  fastify.delete('/categories/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    
    // Check if category has audios before deleting
    const audioCount = await AudioModel.countDocuments({ category: id });
    if (audioCount > 0) {
      return reply.status(400).send({
        success: false,
        error: `Cannot delete category because it has ${audioCount} audio files associated with it.`
      });
    }

    const category = await CategoryModel.findByIdAndDelete(id);
    if (!category) {
      return reply.status(404).send({ success: false, error: 'Category not found' });
    }
    return { success: true, message: 'Category deleted successfully' };
  });

  // AUDIO CRUD
  fastify.get('/audios', async (request: FastifyRequest) => {
    const { page = 1, limit = 10, search } = request.query as any;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [audios, total] = await Promise.all([
      AudioModel.find(query)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AudioModel.countDocuments(query)
    ]);

    return {
      success: true,
      data: audios,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    };
  });

  fastify.post('/audios', async (request: FastifyRequest, reply: FastifyReply) => {
    const {
      title,
      description,
      slug,
      thumbnailUrl,
      audioUrl,
      duration,
      category,
      language,
      featured,
      trending,
      published
    } = request.body as any;

    if (!title || !description || !slug || !thumbnailUrl || !audioUrl || !category || !language) {
      return reply.status(400).send({ success: false, error: 'Missing required fields' });
    }

    try {
      const audio = new AudioModel({
        title,
        description,
        slug,
        thumbnailUrl,
        audioUrl,
        duration: Number(duration) || 0,
        category,
        language,
        featured: !!featured,
        trending: !!trending,
        published: published !== false
      });
      await audio.save();
      return { success: true, data: audio };
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message || 'Error creating audio' });
    }
  });

  fastify.put('/audios/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    const updateData = request.body as any;

    try {
      const audio = await AudioModel.findByIdAndUpdate(
        id,
        { ...updateData },
        { new: true, runValidators: true }
      );
      if (!audio) {
        return reply.status(404).send({ success: false, error: 'Audio not found' });
      }
      return { success: true, data: audio };
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message || 'Error updating audio' });
    }
  });

  fastify.delete('/audios/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    const audio = await AudioModel.findByIdAndDelete(id);
    if (!audio) {
      return reply.status(404).send({ success: false, error: 'Audio not found' });
    }
    
    // Optionally remove files from local system to save space
    // Let's implement local cleanup to keep system clean!
    try {
      if (audio.thumbnailUrl && audio.thumbnailUrl.startsWith('/uploads/')) {
        const thumbPath = path.join(process.cwd(), audio.thumbnailUrl);
        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
      }
      if (audio.audioUrl && audio.audioUrl.startsWith('/uploads/')) {
        const audioPath = path.join(process.cwd(), audio.audioUrl);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      }
    } catch (err) {
      console.error('Error cleaning up audio files:', err);
    }

    return { success: true, message: 'Audio deleted successfully' };
  });

  // BANNERS CRUD
  fastify.get('/banners', async () => {
    const banners = await BannerModel.find().sort({ createdAt: -1 });
    return { success: true, data: banners };
  });

  fastify.post('/banners', async (request: FastifyRequest, reply: FastifyReply) => {
    const { imageUrl, title, description, linkType, linkValue, published } = request.body as any;
    if (!imageUrl || !title || !linkType || !linkValue) {
      return reply.status(400).send({ success: false, error: 'Missing required fields' });
    }

    try {
      const banner = new BannerModel({
        imageUrl,
        title,
        description,
        linkType,
        linkValue,
        published: published !== false
      });
      await banner.save();
      return { success: true, data: banner };
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message || 'Error creating banner' });
    }
  });

  fastify.put('/banners/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    const updateData = request.body as any;

    try {
      const banner = await BannerModel.findByIdAndUpdate(
        id,
        { ...updateData },
        { new: true, runValidators: true }
      );
      if (!banner) {
        return reply.status(404).send({ success: false, error: 'Banner not found' });
      }
      return { success: true, data: banner };
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message || 'Error updating banner' });
    }
  });

  fastify.delete('/banners/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    const banner = await BannerModel.findByIdAndDelete(id);
    if (!banner) {
      return reply.status(404).send({ success: false, error: 'Banner not found' });
    }

    // Clean up local banner image
    try {
      if (banner.imageUrl && banner.imageUrl.startsWith('/uploads/')) {
        const imagePath = path.join(process.cwd(), banner.imageUrl);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.error('Error cleaning up banner image:', err);
    }

    return { success: true, message: 'Banner deleted successfully' };
  });

  // SETTINGS CRUD
  fastify.get('/settings', async () => {
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = new SettingsModel();
      await settings.save();
    }
    return { success: true, data: settings };
  });

  fastify.put('/settings', async (request: FastifyRequest) => {
    const updateData = request.body as any;
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = new SettingsModel(updateData);
    } else {
      Object.assign(settings, updateData);
    }
    await settings.save();
    return { success: true, data: settings };
  });
}
