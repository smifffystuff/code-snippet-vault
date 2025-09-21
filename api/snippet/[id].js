const mongoose = require('mongoose');

// Define Snippet model inline to avoid import issues in Vercel
const snippetSchema = new mongoose.Schema({
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

// Create indexes for search performance
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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Snippet ID is required' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGetById(req, res, id);
      case 'PUT':
        return await handlePutById(req, res, id);
      case 'DELETE':
        return await handleDeleteById(req, res, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/snippet/[id] - Get a single snippet by ID
async function handleGetById(req, res, id) {
  try {
    const snippet = await Snippet.findById(id).select('-__v');
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json(snippet);
  } catch (error) {
    console.error('Error fetching snippet:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid snippet ID' });
    }
    
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
}

// PUT /api/snippet/[id] - Update a snippet
async function handlePutById(req, res, id) {
  try {
    const { title, description, language, code, tags } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(language && { language: language.toLowerCase() }),
      ...(code && { code }),
      ...(tags && { tags: tags.map(tag => tag.toLowerCase()) }),
      updatedAt: Date.now()
    };

    const snippet = await Snippet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
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

// DELETE /api/snippet/[id] - Delete a snippet
async function handleDeleteById(req, res, id) {
  try {
    const snippet = await Snippet.findByIdAndDelete(id);

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid snippet ID' });
    }
    
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
}