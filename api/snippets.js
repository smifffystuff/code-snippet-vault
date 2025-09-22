const mongoose = require('mongoose');
const { clerkClient } = require('@clerk/clerk-sdk-node');

// Define Snippet model inline to avoid import issues in Vercel
const snippetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
    trim: true,
    lowercase: true
  },
  code: {
    type: String,
    required: [true, 'Code content is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
snippetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for search performance (with user-specific optimization)
snippetSchema.index({ userId: 1, createdAt: -1 }, { background: true });
snippetSchema.index({ userId: 1, title: 1 }, { background: true });
snippetSchema.index({ userId: 1, language: 1 }, { background: true });
snippetSchema.index({ userId: 1, tags: 1 }, { background: true });
snippetSchema.index({ title: 1 }, { background: true });
snippetSchema.index({ description: 1 }, { background: true });
snippetSchema.index({ language: 1 }, { background: true });
snippetSchema.index({ tags: 1 }, { background: true });
snippetSchema.index({ createdAt: -1 }, { background: true });

const Snippet = mongoose.models.Snippet || mongoose.model('Snippet', snippetSchema);

// MongoDB connection helper
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return; // Already connected
  }
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔍 MongoDB URI exists:', !!mongoUri);
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// Validation helper
const validateSnippet = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (data.title && data.title.length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }
  if (!data.language || data.language.trim().length === 0) {
    errors.push('Programming language is required');
  }
  if (!data.code || data.code.trim().length === 0) {
    errors.push('Code content is required');
  }
  if (data.description && data.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }
  
  return errors;
};

// Authentication middleware for serverless
const authenticateUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization header');
    }
    
    const token = authHeader.substring(7);
    const payload = await clerkClient.verifyToken(token);
    
    if (!payload || !payload.sub) {
      throw new Error('Invalid token payload');
    }

    const userInfo = {
      id: payload.sub,
      sessionId: payload.sid,
      ...payload
    };

    // Fetch user email from Clerk API
    try {
      const user = await clerkClient.users.getUser(payload.sub);
      userInfo.email = user.emailAddresses?.[0]?.emailAddress || 'unknown@example.com';
    } catch (emailError) {
      console.warn('⚠️ Could not fetch user email from Clerk:', emailError.message);
      userInfo.email = 'unknown@example.com';
    }
    
    return userInfo;
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    throw new Error('Authentication failed');
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    // Authenticate user for all operations
    const user = await authenticateUser(req);
    console.log('🔐 Authenticated user:', user.id);

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, user);
      case 'POST':
        return await handlePost(req, res, user);
      case 'PUT':
        return await handlePut(req, res, user);
      case 'DELETE':
        return await handleDelete(req, res, user);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.message === 'Authentication failed') {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/snippets - Get all snippets with optional filtering and search
async function handleGet(req, res, user) {
  try {
    const { 
      search, 
      language, 
      tags, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Start with user-specific query
    let query = { userId: user.id };

    // Text search in title and description using regex
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Filter by language
    if (language) {
      query.language = language.toLowerCase();
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const snippets = await Snippet.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const total = await Snippet.countDocuments(query);

    res.json({
      snippets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
}

// POST /api/snippets - Create a new snippet
async function handlePost(req, res, user) {
  try {
    const { title, description, language, code, tags } = req.body;

    // Validate input
    const errors = validateSnippet(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const snippet = new Snippet({
      userId: user.id, // Associate with authenticated user
      userEmail: user.email, // Store user's email
      title,
      description,
      language: language.toLowerCase(),
      code,
      tags: tags ? tags.map(tag => tag.toLowerCase()) : []
    });

    const savedSnippet = await snippet.save();
    console.log('✅ Created snippet for user:', user.id);
    
    res.status(201).json(savedSnippet);
  } catch (error) {
    console.error('Error creating snippet:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    res.status(500).json({ error: 'Failed to create snippet' });
  }
}

// PUT /api/snippets - Update a snippet (requires ID in query)
async function handlePut(req, res, user) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Snippet ID is required' });
    }

    const { title, description, language, code, tags } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(language && { language: language.toLowerCase() }),
      ...(code && { code }),
      ...(tags && { tags: tags.map(tag => tag.toLowerCase()) }),
      updatedAt: Date.now()
    };

    const snippet = await Snippet.findOneAndUpdate(
      { _id: id, userId: user.id }, // Ensure user can only update their own snippets
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found or access denied' });
    }

    res.json(snippet);
  } catch (error) {
    console.error('Error updating snippet:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid snippet ID' });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    res.status(500).json({ error: 'Failed to update snippet' });
  }
}

// DELETE /api/snippets - Delete a snippet (requires ID in query)
async function handleDelete(req, res, user) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Snippet ID is required' });
    }

    const snippet = await Snippet.findOneAndDelete({ 
      _id: id, 
      userId: user.id // Ensure user can only delete their own snippets
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found or access denied' });
    }

    console.log('✅ Deleted snippet for user:', user.id);
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid snippet ID' });
    }
    
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
}