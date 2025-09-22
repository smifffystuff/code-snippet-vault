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
      mySnippets = false // New parameter to filter user's own snippets
    } = req.query;

    let query = {};

    // If user is authenticated and wants only their snippets
    if (req.user && mySnippets === 'true') {
      query.userId = req.user.id;
    } else if (req.user && !mySnippets) {
      // If authenticated but viewing all, still show only user's snippets for now
      // Later we can make this configurable for public/private snippets
      query.userId = req.user.id;
    } else if (!req.user) {
      // For anonymous users, return empty array for now
      // Later we can show public snippets
      return res.json({
        snippets: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      });
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
// GET /api/snippets/:id - Get a single snippet by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ 
      _id: req.params.id,
      userId: req.user.id  // Ensure user can only access their own snippets
    }).select('-__v');
    
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
});

// POST /api/snippets - Create a new snippet
// POST /api/snippets - Create a new snippet
router.post('/', requireAuth, validateSnippet, async (req, res) => {
  try {
    const { title, description, language, code, tags } = req.body;

    const snippet = new Snippet({
      title,
      description,
      language: language.toLowerCase(),
      code,
      tags: tags ? tags.map(tag => tag.toLowerCase()) : [],
      userId: req.user.id,  // Associate snippet with authenticated user
      userEmail: req.user.email || 'unknown@example.com'  // Store user's email
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

module.exports = router;