const express = require('express');
const router = express.Router();
const Snippet = require('../models/Snippet');
const { validateSnippet, validateSnippetUpdate } = require('../middleware/validation');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// GET /api/snippets - Get all snippets with optional filtering and search
// Using optionalAuth so public browsing works but we can filter by user if authenticated
router.get('/', optionalAuth, async (req, res) => {
  console.log('Fetching snippets with query:', req.query);
  console.log('User:', req.user ? req.user.id : 'Anonymous');
  try {
    const { 
      search, 
      language, 
      tags, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      view = 'my' // 'my' for user's snippets, 'public' for public snippets, 'all' for both
    } = req.query;

    let query = {};

    // Handle different views
    if (view === 'public') {
      // Show only public snippets
      query.isPublic = true;
    } else if (view === 'all' && req.user) {
      // Show user's snippets AND public snippets
      query.$or = [
        { userId: req.user.id },
        { isPublic: true }
      ];
    } else if (req.user) {
      // Default: show only user's snippets (my snippets)
      query.userId = req.user.id;
    } else {
      // Anonymous users can only see public snippets
      query.isPublic = true;
    }

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
});

// GET /api/snippets/:id - Get a single snippet by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    // Authenticated users can access their own snippets or public ones
    const query = {
      _id: req.params.id,
      $or: [
        { userId: req.user.id },
        { isPublic: true }
      ]
    };
    
    const snippet = await Snippet.findOne(query).select('-__v');
    
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found or access denied' });
    }

    res.json(snippet);
  } catch (error) {
    console.error('Error fetching snippet:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid snippet ID' });
    }
    
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
});

// POST /api/snippets - Create a new snippet
// POST /api/snippets - Create a new snippet
router.post('/', requireAuth, validateSnippet, async (req, res) => {
  try {
    const { title, description, language, code, tags, isPublic } = req.body;

    console.log('Got snippet create', req.body)
    const snippet = new Snippet({
      title,
      description,
      language: language.toLowerCase(),
      code,
      tags: tags ? tags.map(tag => tag.toLowerCase()) : [],
      userId: req.user.id,  // Associate snippet with authenticated user
      userEmail: req.user.email || 'unknown@example.com',  // Store user's email
      isPublic: Boolean(isPublic) || false  // Set public visibility
    });

    const savedSnippet = await snippet.save();
    
    res.status(201).json(savedSnippet);
  } catch (error) {
    console.error('Error creating snippet:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    res.status(500).json({ error: 'Failed to create snippet' });
  }
});

// PUT /api/snippets/:id - Update a snippet
// PUT /api/snippets/:id - Update a snippet
router.put('/:id', requireAuth, validateSnippetUpdate, async (req, res) => {
  try {
    const { title, description, language, code, tags, isPublic } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(language && { language: language.toLowerCase() }),
      ...(code && { code }),
      ...(tags && { tags: tags.map(tag => tag.toLowerCase()) }),
      ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
      updatedAt: Date.now()
    };

    const snippet = await Snippet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },  // Ensure user can only update their own snippets
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
});

// DELETE /api/snippets/:id - Delete a snippet
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id  // Ensure user can only delete their own snippets
    });

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
});

// GET /api/snippets/stats/summary - Get statistics about snippets
router.get('/stats/summary', requireAuth, async (req, res) => {
  try {
    const totalSnippets = await Snippet.countDocuments({ userId: req.user.id });
    
    const languageStats = await Snippet.aggregate([
      { $match: { userId: req.user.id } },  // Filter by user
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const tagStats = await Snippet.aggregate([
      { $match: { userId: req.user.id } },  // Filter by user
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalSnippets,
      topLanguages: languageStats,
      topTags: tagStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/snippets/public - Get public snippets (no auth required)
router.get('/public', async (req, res) => {
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

    let query = { isPublic: true };

    // Text search in title and description using regex
    if (search) {
      const searchRegex = new RegExp(search, 'i');
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
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
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
    console.error('Error fetching public snippets:', error);
    res.status(500).json({ error: 'Failed to fetch public snippets' });
  }
});

module.exports = router;