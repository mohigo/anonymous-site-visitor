import { connectToDatabase } from '../../../lib/db';
import { cors } from '../../../lib/cors';

export default async function handler(req, res) {
  // Handle CORS
  if (cors(req, res)) {
    return; // Return early if this was a preflight request
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the database connection
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    // Get the data from the request body
    const data = req.body;
    
    // Basic validation
    if (!data.siteId) {
      return res.status(400).json({ error: 'siteId is required' });
    }

    if (!data.eventName) {
      return res.status(400).json({ error: 'eventName is required' });
    }

    // Add server-side timestamp
    data.serverTimestamp = new Date();
    
    // Store IP address if not in privacy mode
    if (!data.anonymizeIp) {
      // Get IP address from various possible headers
      const ip = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.connection.remoteAddress;
      
      data.ipAddress = ip;
    }

    // Insert the data into the events collection
    await db.collection('events').insertOne(data);

    // Update site stats
    await db.collection('sites').updateOne(
      { siteId: data.siteId },
      { 
        $inc: { [`eventCounts.${data.eventName}`]: 1, totalEvents: 1 },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true }
    );

    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 