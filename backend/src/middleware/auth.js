const { clerkClient } = require('@clerk/clerk-sdk-node');

// Middleware to verify Clerk JWT tokens
const requireAuth = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No valid authorization token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Clerk
    const payload = await clerkClient.verifyToken(token);
    
    if (!payload || !payload.sub) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token' 
      });
    }

    // Add user information to the request object
    req.user = {
      id: payload.sub,
      email: payload.email || payload.email_address || null,
      sessionId: payload.sid,
      ...payload
    };

    console.log('🔐 Authenticated user:', req.user.id, 'Email:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Token has expired' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication failed' 
    });
  }
};

// Optional middleware for routes that work with or without auth
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = await clerkClient.verifyToken(token);
      
      if (payload && payload.sub) {
        req.user = {
          id: payload.sub,
          sessionId: payload.sid,
          ...payload
        };
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't fail - just continue without user
    console.warn('⚠️ Optional auth failed:', error.message);
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth
};