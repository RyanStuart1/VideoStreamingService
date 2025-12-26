const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Use built-in fetch (Node 18+). If you're on older Node, install node-fetch and swap this.
const fetch = global.fetch;
if (!fetch) {
  throw new Error('fetch is not available. Use Node 18+ or install node-fetch.');
}

// MongoDB configuration
const mongoURI = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION_NAME;

const client = new MongoClient(mongoURI);
let collection;

// Hardcoded videos array
const hardcodedVideos = [
  {
    _id: '1',
    title: 'Big Buck Bunny',
    thumbnail: 'https://video-streaming-service-rs.s3.us-east-1.amazonaws.com/BuckBunny.png',
    url: 'https://video-streaming-service-rs.s3.us-east-1.amazonaws.com/big_buck_bunny_1080p_h264.mp4',
  },
];

// Function to connect to MongoDB with retries
async function connectToMongoDB() {
  const maxRetries = 5;
  const retryDelayMs = 5000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.connect();
      console.log('Connected to MongoDB');

      const db = client.db(dbName);
      collection = db.collection(collectionName);
      return;
    } catch (error) {
      console.error(
        `Attempt ${attempt} failed: Failed to connect to MongoDB. Retrying in ${retryDelayMs / 1000} seconds...`
      );

      if (attempt === maxRetries) {
        console.error('Max retries reached. Could not connect to MongoDB. Exiting.');
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

connectToMongoDB();

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://98.85.96.246:3004'],
    credentials: true,
  })
);
app.use(express.json());

// Route to fetch all video metadata
app.get('/videos', async (req, res) => {
  try {
    let videos = [...hardcodedVideos];

    if (collection) {
      const dbVideos = await collection.find({}).toArray();
      videos = [...videos, ...dbVideos];
    }

    if (videos.length === 0) {
      return res.status(404).json({ error: 'No video metadata found' });
    }

    return res.json(videos);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route to fetch metadata for a specific video by ID
app.get('/videos/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

    // Check hardcoded first
    const hardcodedVideo = hardcodedVideos.find((video) => video._id === videoId);
    if (hardcodedVideo) return res.json(hardcodedVideo);

    // Then check Mongo
    if (collection) {
      const query = ObjectId.isValid(videoId) ? { _id: new ObjectId(videoId) } : { _id: videoId };
      const video = await collection.findOne(query);

      if (!video) return res.status(404).json({ error: 'Video metadata not found' });
      return res.json(video);
    }

    return res.status(404).json({ error: 'Video metadata not found' });
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route to handle video streaming (Range requests)
app.get('/stream/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

    // Find video (hardcoded first, then Mongo)
    let video = hardcodedVideos.find((v) => v._id === videoId);

    if (!video && collection) {
      const query = ObjectId.isValid(videoId) ? { _id: new ObjectId(videoId) } : { _id: videoId };
      video = await collection.findOne(query);
    }

    if (!video) return res.status(404).json({ error: 'Video not found' });

    const range = req.headers.range;
    if (!range || !range.startsWith('bytes=')) {
      return res.status(400).send('Invalid or missing Range header');
    }

    const videoUrl = video.url;

    // HEAD request to get the total size
    const headResponse = await fetch(videoUrl, { method: 'HEAD' });
    if (!headResponse.ok) {
      console.error('Error fetching video metadata from S3');
      return res.status(500).json({ error: 'Failed to fetch video metadata from S3' });
    }

    const videoSize = parseInt(headResponse.headers.get('content-length') || '0', 10);
    if (!videoSize) {
      return res.status(500).json({ error: 'Missing content-length from video source' });
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB

    // Proper Range parsing
    const [startStr, endStr] = range.replace('bytes=', '').split('-');
    const start = parseInt(startStr, 10);
    const requestedEnd = endStr ? parseInt(endStr, 10) : NaN;

    if (Number.isNaN(start) || start < 0 || start >= videoSize) {
      return res.status(416).send('Requested Range Not Satisfiable');
    }

    const end = !Number.isNaN(requestedEnd)
      ? Math.min(requestedEnd, videoSize - 1)
      : Math.min(start + CHUNK_SIZE - 1, videoSize - 1);

    const contentLength = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    });

    const videoStreamResponse = await fetch(videoUrl, {
      headers: { Range: `bytes=${start}-${end}` },
    });

    if (!videoStreamResponse.ok || !videoStreamResponse.body) {
      console.error('Error streaming video chunk');
      return res.status(500).json({ error: 'Failed to stream video chunk from S3' });
    }

    videoStreamResponse.body.pipe(res);
  } catch (error) {
    console.error('Error in stream endpoint:', error);
    return res.status(500).json({ error: 'Failed to stream video' });
  }
});

// Default route for invalid endpoints
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Cleanup on termination
process.on('SIGINT', async () => {
  try {
    console.log('Closing MongoDB connection');
    await client.close();
  } finally {
    process.exit(0);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Video Streaming Service running on port ${port}`);
  // Avoid logging secrets/URIs in real deployments
  // console.log(`MongoDB URI: ${mongoURI}`);
});
