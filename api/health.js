const mongoose = require('mongoose');

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Code Snippet Vault API',
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error',
      timestamp: new Date().toISOString(),
      service: 'Code Snippet Vault API',
      database: 'Disconnected',
      error: error.message
    });
  }
}