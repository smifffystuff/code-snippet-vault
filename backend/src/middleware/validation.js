const Joi = require('joi');

const snippetSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  language: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Programming language is required'
    }),
  
  code: Joi.string()
    .required()
    .messages({
      'string.empty': 'Code content is required'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim())
    .default([]),
  
  isPublic: Joi.boolean()
    .default(false)
});

const snippetUpdateSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Title cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  language: Joi.string()
    .trim(),
  
  code: Joi.string(),
  
  tags: Joi.array()
    .items(Joi.string().trim()),
  
  isPublic: Joi.boolean()
}).min(1); // At least one field must be provided for update

const validateSnippet = (req, res, next) => {
  const { error, value } = snippetSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  req.body = value;
  next();
};

const validateSnippetUpdate = (req, res, next) => {
  const { error, value } = snippetUpdateSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateSnippet,
  validateSnippetUpdate
};