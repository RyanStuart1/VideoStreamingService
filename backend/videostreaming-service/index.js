const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const fetch = require('node-fetch');
require('dotenv').config();

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
app.get('/videos/:id', async (req, res) => {
  try {
    const videoId = req.params.id;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Convert to ObjectId if it looks like one
    const query = ObjectId.isValid(videoId) ? { _id: ObjectId(videoId) } : { _id: videoId };
    const video = await collection.findOne(query);

    if (!video) {
      return res.status(404).json({ error: 'Video metadata not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route to stream video from S3
app.get('/stream/:id', async (req, res) => {
  try {
    const videoId = req.params.id;

    const video = await collection.findOne({ _id: videoId });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const s3Url = video.url;
    const range = req.headers.range;

    if (!range) {
      return res.status(400).send('Requires Range header');
    }

    // Fetch video data from S3
    const headers = { Range: range };
    const response = await fetch(s3Url, { headers });

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch video from S3');
    }

    res.writeHead(response.status, response.headers.raw());
    response.body.pipe(res); // Pipe video data to the client
  } catch (error) {
    console.error('Error streaming video:', error);
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