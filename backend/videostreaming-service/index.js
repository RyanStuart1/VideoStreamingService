const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Using dynamic import for node-fetch (compatible with node-fetch v3+)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const port = process.env.PORT || 3001;

// MongoDB configuration
const mongoURI = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION_NAME;

const client = new MongoClient(mongoURI);
let collection;

// Function to connect to MongoDB with retries
async function connectToMongoDB() {
  const maxRetries = 5;
  const retryDelay = 5000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.connect();
      console.log('Connected to MongoDB');
      const db = client.db(dbName);
      collection = db.collection(collectionName);
      return; // Exit the loop if connection is successful
    } catch (error) {
      console.error(
        `Attempt ${attempt} failed: Failed to connect to MongoDB. Retrying in ${retryDelay / 1000} seconds...`
      );
      if (attempt === maxRetries) {
        console.error('Max retries reached. Could not connect to MongoDB. Exiting.');
        process.exit(1); // Exit only if retries are exhausted
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

connectToMongoDB();

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware to enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Respond to preflight requests
  }
  next();
});

// Route to fetch all video metadata
app.get('/videos', async (req, res) => {
  try {
    const videos = await collection.find({}).toArray();
    if (videos.length === 0) {
      return res.status(404).json({ error: 'No video metadata found' });
    }
    res.json(videos);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route to fetch metadata for a specific video by ID
app.get('/api/videos/:id', async (req, res) => {
  try {
    const videoId = req.params.id;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const video = await collection.findOne({ _id: videoId });

    if (!video) {
      return res.status(404).json({ error: 'Video metadata not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route to handle video streaming
app.get('/api/stream/:id', async (req, res) => {
  try {
    const videoId = req.params.id;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Fetch video metadata from MongoDB
    const video = await collection.findOne({ _id: videoId });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const range = req.headers.range;
    if (!range) {
      return res.status(400).send('Requires Range header');
    }

    const videoUrl = video.url; // Assuming the public URL is stored in MongoDB
    const headResponse = await fetch(videoUrl, { method: 'HEAD' });

    if (!headResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch video metadata from S3' });
    }

    const videoSize = headResponse.headers.get('content-length');

    // Parse Range
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Set response headers
    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);

    // Stream video chunk
    const videoStream = await fetch(videoUrl, {
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    });

    if (!videoStream.ok) {
      return res.status(500).json({ error: 'Failed to stream video chunk from S3' });
    }

    videoStream.body.pipe(res);
  } catch (error) {
    console.error('Error in stream endpoint:', error);
    res.status(500).json({ error: 'Failed to stream video' });
  }
});

// Default route for invalid endpoints
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Cleanup on termination
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection');
  await client.close();
  process.exit(0);
});

// Start the server
app.listen(port, () => {
  console.log(`Video Streaming Service running on port ${port}`);
  console.log(`MongoDB URI: ${mongoURI}`);
});
