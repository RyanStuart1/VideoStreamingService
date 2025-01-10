const express = require('express');
const { MongoClient } = require('mongodb'); // Removed ObjectId import since we are using string _id
const { spawn } = require('child_process');
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

    // Query MongoDB using string _id
    const video = await collection.findOne({ _id: videoId });

    if (!video) {
      return res.status(404).json({ error: 'Video metadata not found' });
    }

    res.json(video); // Return the video metadata
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route to stream video from S3
app.get('/stream/:id', async (req, res) => {
  try {
    const videoId = req.params.id;

    // Query MongoDB using string _id
    const video = await collection.findOne({ _id: videoId });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const s3Path = video.url; // Use the S3 URL from the database
    if (!s3Path) {
      return res.status(400).json({ error: 'S3 path is missing for this video' });
    }

    res.json({
      message: 'Streaming started',
      rtmpUrl: s3Path, // Return the public S3 URL
    });
  } catch (error) {
    console.error('Error starting stream:', error);
    res.status(500).json({ error: 'Failed to start streaming' });
  }
});

// Default route for invalid endpoints
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Video Streaming Service running on port ${port}`);
  console.log(`MongoDB URI: ${mongoURI}`);
});
