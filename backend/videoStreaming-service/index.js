const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001; // Use environment variable or fallback

// Configure AWS DynamoDB client with optional VPC Endpoint
const dynamoDbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1', // AWS Region
  endpoint: process.env.DYNAMO_VPC_ENDPOINT || undefined, // Use VPC endpoint if provided
});

// Create a DynamoDB Document Client for easier interaction
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);

// Table name from environment variable or default
const tableName = process.env.DYNAMO_TABLE_NAME || 'VideosMetaData'; 

// Route to fetch all video metadata
app.get('/videos', async (req, res) => {
  try {
    console.log(`Fetching all video metadata from table: ${tableName}`);
    const params = { TableName: tableName };
    console.log('ScanCommand Params:', params);

    const data = await dynamoDb.send(new ScanCommand(params)); // Fetch all items
    if (!data.Items || data.Items.length === 0) {
      console.warn('No video metadata found in the table.');
      return res.status(404).json({ error: 'No video metadata found' });
    }

    console.log('ScanCommand Result:', JSON.stringify(data.Items, null, 2));
    res.json(data.Items); // Respond with all video metadata
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Route to fetch metadata for a specific video by ID
app.get('/videos/:id', async (req, res) => {
  try {
    let videoId = req.params.id; // Treat ID as string by default
    console.log(`Fetching metadata for video with ID: ${videoId}`);

    // Convert ID to number if the table uses `N` (number) as the type for `id`
    if (process.env.DYNAMO_ID_TYPE === 'N') {
      videoId = parseInt(videoId, 10);
      if (isNaN(videoId)) {
        console.error('Invalid video ID provided:', req.params.id);
        return res.status(400).json({ error: 'Invalid video ID' });
      }
    }

    const params = {
      TableName: tableName,
      Key: { id: videoId }, // Use `id` as string or number
    };
    console.log('DynamoDB GetCommand Params:', JSON.stringify(params, null, 2));

    const command = new GetCommand(params);
    const data = await dynamoDb.send(command);

    if (!data.Item) {
      console.warn(`Video metadata with ID ${videoId} not found.`);
      return res.status(404).json({ error: 'Video metadata not found' });
    }

    console.log('GetCommand Result:', JSON.stringify(data.Item, null, 2));
    res.json(data.Item);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Start the server with logging
app.listen(port, () => {
  console.log(`AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`Video Metadata Service running on port ${port}`);
});
