import { connectToDatabase } from '../../../lib/mongodb';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the database connection
    const { db } = await connectToDatabase();

    // Get the data from the request body
    const { siteName, domain, userId } = req.body;
    
    // Basic validation
    if (!siteName) {
      return res.status(400).json({ error: 'siteName is required' });
    }

    if (!domain) {
      return res.status(400).json({ error: 'domain is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Generate a unique siteId
    const siteId = nanoid(10);

    // Create the site record
    const site = {
      siteId,
      siteName,
      domain,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalPageviews: 0,
      totalEvents: 0,
      eventCounts: {},
      status: 'active'
    };

    // Insert the site into the sites collection
    await db.collection('sites').insertOne(site);

    // Also update the user's sites list
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $push: { sites: siteId },
        $set: { updatedAt: new Date() }
      }
    );

    // Return the site details
    return res.status(201).json({
      success: true,
      site: {
        siteId,
        siteName,
        domain,
        createdAt: site.createdAt
      }
    });
  } catch (error) {
    console.error('Error registering site:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 