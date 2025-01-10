const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId
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

    // Convert string to ObjectId and query MongoDB
    const video = await collection.findOne({ _id: new ObjectId(videoId) });

    if (!video) {
      return res.status(404).json({ error: 'Video metadata not found' });
    }

    res.json(video); // Return the video metadata
  } catch (error) {
    console.error('Error fetching video metadata:', error);

    // Handle invalid ObjectId format
    if (error instanceof Error && error.message.includes('Argument passed in must be a string of 12 bytes or a string of 24 hex characters')) {
      return res.status(400).json({ error: 'Invalid video ID format' });
    }

    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route to stream video from S3
app.get('/stream/:id', async (req, res) => {
  try {
    const videoId = req.params.id;

    // Convert string to ObjectId and query MongoDB
    const video = await collection.findOne({ _id: new ObjectId(videoId) });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const s3Path = video.url; // Use the S3 URL from the database
    if (!s3Path) {
      return res.status(400).json({ error: 'S3 path is missing for this video' });
    }

    const streamKey = videoId; // Use the video ID as the RTMP stream key
    const rtmpUrl = `rtmp://54.197.170.44/vod/${streamKey}`; // Replace with your EC2 public IP or DNS

    // Spawn FFmpeg to stream video
    const ffmpeg = spawn('ffmpeg', ['-re', '-i', s3Path, '-c:v', 'copy', '-c:a', 'copy', '-f', 'flv', rtmpUrl]);

    ffmpeg.stderr.on('data', (data) => {
      console.error(`FFmpeg error: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        console.error(`FFmpeg exited with code ${code}`);
        return res.status(500).json({ error: `FFmpeg exited with code ${code}` });
      }
    });

    res.json({
      message: 'Streaming started',
      rtmpUrl: rtmpUrl, // Return the public RTMP URL
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
