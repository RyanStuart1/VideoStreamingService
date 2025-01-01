const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.VIDEO_SERVICE_PORT || 3001;

// MongoDB connection URI from .env file
const uri = process.env.DOCUMENTDB_URI;
const client = new MongoClient(uri);

let videoCollection;

// Connect to DocumentDB and initialize collection
const connectToDB = async () => {
  try {
    await client.connect();
    const database = client.db('videoStreamingDB'); // Replace with your database name
    videoCollection = database.collection('videos');
    console.log('Connected to DocumentDB');
  } catch (error) {
    console.error('Error connecting to DocumentDB:', error);
    process.exit(1); // Exit if the connection fails
  }
};

// Route to fetch all video metadata
app.get('/videos', async (req, res) => {
  try {
    const videos = await videoCollection.find({}).toArray(); // Fetch all videos
    res.json(videos); // Respond with the video metadata
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Route to fetch a single video by ID
app.get('/videos/:id', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const video = await videoCollection.findOne({ id: videoId }); // Find video by ID
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Start the server
app.listen(port, async () => {
  await connectToDB(); // Connect to DocumentDB before starting the server
  console.log(`Video Service running on port ${port}`);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});