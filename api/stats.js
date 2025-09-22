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
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
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
snippetSchema.index({ userId: 1, language: 1 }, { background: true });
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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Authenticate user
    const user = await authenticateUser(req);
    console.log('🔐 Getting stats for user:', user.id);

    const { view = 'my' } = req.query;

    let query = {};
    
    // Determine query based on view (all views require authentication)
    if (view === 'my') {
      query.userId = user.id;
    } else if (view === 'public') {
      query.isPublic = true;
    } else if (view === 'all') {
      // Authenticated users can see their own snippets + public ones
      query = {
        $or: [
          { userId: user.id },
          { isPublic: true }
        ]
      };
    }

    // Get stats based on the query
    const totalSnippets = await Snippet.countDocuments(query);
    
    const languageStats = await Snippet.aggregate([
      { $match: query },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const tagStats = await Snippet.aggregate([
      { $match: query },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalSnippets,
      topLanguages: languageStats,
      topTags: tagStats,
      view
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    
    if (error.message === 'Authentication failed') {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}