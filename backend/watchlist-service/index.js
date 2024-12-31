const express = require('express');
const app = express();
const port = 3002;

const watchlist = [
  { id: 1, title: 'Introduction to Docker', status: 'To Watch' },
  { id: 2, title: 'Microservices with Node.js', status: 'Watched' },
  { id: 3, title: 'React for Beginners', status: 'To Watch' },
];

app.get('/watchlist', (req, res) => {
  res.json(watchlist);
});

// Route to get a specific watchlist item by ID
app.get('/watchlist/:id', (req, res) => {
  const videoId = parseInt(req.params.id);
  const video = watchlist.find((item) => item.id === videoId);

  if (video) {
    res.json(video);
  } else {
    res.status(404).json({ message: 'Video not found in the watchlist' });
  }
});

// Start the Watchlist Service
app.listen(port, () => {
  console.log(`Watchlist Service running on port ${port}`);
});