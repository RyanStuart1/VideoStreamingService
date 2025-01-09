const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001; // Use environment variable or fallback

// MongoDB configuration
const mongoURI = process.env.MONGO_URI || 'mongodb://3.87.2.83:27017'; // Replace <EC2-PUBLIC-IP> with the public IP or DNS hostname of your EC2 instance
const dbName = process.env.MONGO_DB_NAME || 'VideoStreamingDB'; // Database name
const collectionName = process.env.MONGO_COLLECTION_NAME || 'VideosMetaData'; // Collection name

// MongoDB client instance
const client = new MongoClient(mongoURI);

let collection; // MongoDB collection reference

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    collection = db.collection(collectionName); // Reference to the collection
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Route to fetch all video metadata
app.get('/videos', async (req, res) => {
  try {
    console.log('Fetching all video metadata from MongoDB');
    const videos = await collection.find({}).toArray(); // Fetch all documents in the collection
    if (videos.length === 0) {
      console.warn('No video metadata found in the database.');
      return res.status(404).json({ error: 'No video metadata found' });
    }
    console.log('Fetched videos:', videos);
    res.json(videos); // Respond with all video metadata
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route to fetch metadata for a specific video by ID
app.get('/videos/:id', async (req, res) => {
  try {
    const videoId = req.params.id; // Video ID from the request parameter
    console.log(`Fetching metadata for video with ID: ${videoId}`);

    const video = await collection.findOne({ _id: new ObjectId(videoId) }); // Find video by ID
    if (!video) {
      console.warn(`Video with ID ${videoId} not found.`);
      return res.status(404).json({ error: 'Video metadata not found' });
    }
    console.log('Fetched video:', video);
    res.json(video); // Respond with specific video metadata
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Start the server with logging
app.listen(port, () => {
  console.log(`MongoDB URI: ${mongoURI}`);
  console.log(`Video Metadata Service running on port ${port}`);
});
