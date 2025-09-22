const mongoose = require('mongoose');

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
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true  // Index for efficient querying
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

// Create indexes for search performance (avoiding text index due to language conflicts)
// User-specific indexes for efficient queries
snippetSchema.index({ userId: 1, createdAt: -1 }, { background: true });
snippetSchema.index({ userId: 1, title: 1 }, { background: true });
snippetSchema.index({ userId: 1, language: 1 }, { background: true });
snippetSchema.index({ userId: 1, tags: 1 }, { background: true });

// General indexes for search within user data
snippetSchema.index({ title: 1 }, { background: true });
snippetSchema.index({ description: 1 }, { background: true });
snippetSchema.index({ language: 1 }, { background: true });
snippetSchema.index({ tags: 1 }, { background: true });
snippetSchema.index({ createdAt: -1 }, { background: true });

module.exports = mongoose.model('Snippet', snippetSchema);