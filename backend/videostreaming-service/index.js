const express = require('express');
const { MongoClient } = require('mongodb');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// MongoDB configuration
const mongoURI = process.env.MONGO_URI || 'mongodb://44.210.112.33:27017'; // Public IP of MongoDB EC2 instance
const dbName = process.env.MONGO_DB_NAME || 'VideoStreamingDB';
const collectionName = process.env.MONGO_COLLECTION_NAME || 'VideosMetaData';

const client = new MongoClient(mongoURI);
let collection;

// Connect to MongoDB with retries
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    collection = db.collection(collectionName);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit the process on failure
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
    const videoId = req.params.id; // Get the ID from the URL

    // Query MongoDB using the string ID
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

    // Query MongoDB using the string ID
    const video = await collection.findOne({ _id: videoId });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const s3Path = video.url; // Use the S3 URL from the database
    if (!s3Path) {
      return res.status(400).json({ error: 'S3 path is missing for this video' });
    }

    const streamKey = videoId; // Use the video ID as the RTMP stream key
    const rtmpUrl = `rtmp://<your-ec2-public-ip>/vod/${streamKey}`; // Replace <your-ec2-public-ip> with your actual public IP or DNS

    // Spawn FFmpeg to stream video
    const ffmpeg = spawn("ffmpeg", [
      "-re",
      "-i", s3Path,
      "-c:v", "copy",
      "-c:a", "copy",
      "-f", "flv",
      rtmpUrl
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.error(`FFmpeg error: ${data}`);
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        console.error(`FFmpeg exited with code ${code}`);
        return res.status(500).json({ error: `FFmpeg exited with code ${code}` });
      }
    });

    res.json({
      message: "Streaming started",
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
