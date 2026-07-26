import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CategoryModel, AudioModel, BannerModel, SettingsModel } from '../models.js';

export default async function publicRoutes(fastify: FastifyInstance) {
  // Cache utilities (10-second memory cache for public feeds to handle high concurrent load)
  const cache: { [key: string]: { data: any; expiry: number } } = {};
  
  function getCached(key: string) {
    const entry = cache[key];
    if (entry && entry.expiry > Date.now()) {
      return entry.data;
    }
    return null;
  }

  function setCache(key: string, data: any, ttlMs = 10000) {
    cache[key] = { data, expiry: Date.now() + ttlMs };
  }

  // Get active banners
  fastify.get('/banners', async () => {
    const cacheKey = 'banners';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const banners = await BannerModel.find({ published: true }).sort({ createdAt: -1 });
    const response = { success: true, data: banners };
    setCache(cacheKey, response, 30000); // Cache banners for 30s
    return response;
  });

  // Get Featured Audios
  fastify.get('/audios/featured', async () => {
    const cacheKey = 'featured';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const audios = await AudioModel.find({ featured: true, published: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const response = { success: true, data: audios };
    setCache(cacheKey, response);
    return response;
  });

  // Get Trending Audios
  fastify.get('/audios/trending', async () => {
    const cacheKey = 'trending';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const audios = await AudioModel.find({ trending: true, published: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(10);

    const response = { success: true, data: audios };
    setCache(cacheKey, response);
    return response;
  });

  // Get Latest Audios
  fastify.get('/audios/latest', async () => {
    const cacheKey = 'latest';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const audios = await AudioModel.find({ published: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(10);

    const response = { success: true, data: audios };
    setCache(cacheKey, response);
    return response;
  });

  // Get Categories
  fastify.get('/categories', async () => {
    const cacheKey = 'categories';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const categories = await CategoryModel.find().sort({ name: 1 });
    const response = { success: true, data: categories };
    setCache(cacheKey, response, 60000); // Cache categories for 1 min
    return response;
  });

  // Get Audios by Category Slug
  fastify.get('/categories/:slug/audios', async (request: FastifyRequest, reply: FastifyReply) => {
    const { slug } = request.params as any;
    const cacheKey = `category_${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const category = await CategoryModel.findOne({ slug });
    if (!category) {
      return reply.status(404).send({ success: false, error: 'Category not found' });
    }

    const audios = await AudioModel.find({ category: category._id, published: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    const response = { success: true, data: { category, audios } };
    setCache(cacheKey, response, 15000); // Cache for 15s
    return response;
  });

  // Search & Filter Audios (Title, Description, or Category)
  fastify.get('/audios/search', async (request: FastifyRequest) => {
    const { q, category } = request.query as any;
    
    const query: any = { published: true };

    if (category) {
      // Find category first
      const cat = await CategoryModel.findOne({ $or: [{ slug: category }, { name: category }] });
      if (cat) {
        query.category = cat._id;
      }
    }

    if (q) {
      // If we have full-text index we can use text search, otherwise regex search for fuzzy matches
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const audios = await AudioModel.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(30);

    return { success: true, data: audios };
  });

  // Get Audio Details by Slug
  fastify.get('/audios/:slug', async (request: FastifyRequest, reply: FastifyReply) => {
    const { slug } = request.params as any;
    const audio = await AudioModel.findOne({ slug, published: true })
      .populate('category', 'name slug');
    
    if (!audio) {
      return reply.status(404).send({ success: false, error: 'Audio not found' });
    }

    return { success: true, data: audio };
  });

  // Get Related Audios (audios of the same category, excluding current)
  fastify.get('/audios/:id/related', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as any;
    const audio = await AudioModel.findOne({ _id: id, published: true });
    if (!audio) {
      return reply.status(404).send({ success: false, error: 'Audio not found' });
    }

    const related = await AudioModel.find({
      category: audio.category,
      _id: { $ne: audio._id },
      published: true
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(6);

    return { success: true, data: related };
  });

  // Get Public settings
  fastify.get('/settings', async () => {
    const cacheKey = 'settings';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = new SettingsModel();
      await settings.save();
    }
    const response = { success: true, data: settings };
    setCache(cacheKey, response, 60000); // Cache settings for 1 min
    return response;
  });
}
