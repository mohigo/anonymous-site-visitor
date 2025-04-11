// CORS middleware for API routes
export function cors(req, res) {
  // Get the origin from the request headers
  const origin = req.headers.origin || '';
  
  // Set CORS headers - instead of wildcard, use the specific origin
  res.setHeader('Access-Control-Allow-Origin', origin); // Allow the specific origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Return true to indicate the preflight request is handled
  }
  
  return false; // Continue with the actual request
} 