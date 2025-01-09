const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// MongoDB configuration
const mongoURI = process.env.MONGO_URI || 'mongodb://3.87.2.83:27017'; // Public IP of MongoDB EC2 instance
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
    console.error('Failed to connect to MongoDB. Retrying in 5 seconds...', error);
    setTimeout(connectToMongoDB, 5000); // Retry connection after 5 seconds
  }
}

connectToMongoDB();

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
    if (!ObjectId.isValid(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID format' });
    }

    const video = await collection.findOne({ _id: new ObjectId(videoId) });
    if (!video) {
      return res.status(404).json({ error: 'Video metadata not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Video Metadata Service running on port ${port}`);
  console.log(`MongoDB URI: ${mongoURI}`);
});
