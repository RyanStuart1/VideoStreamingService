const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3002;

app.use(cors({
  origin: ['http://localhost:3000', 'http://98.85.96.246:3004'],
  credentials: true
}));
app.use(express.json());

const watchlist = [
  { id: 1, title: 'Introduction to Docker', status: 'To Watch' },
  { id: 2, title: 'Microservices with Node.js', status: 'Watched' },
  { id: 3, title: 'React for Beginners', status: 'To Watch' },
];

app.get('/watchlist', (req, res) => {
  res.json(watchlist);
});

app.get('/watchlist/:id', (req, res) => {
  const videoId = parseInt(req.params.id, 10);
  const video = watchlist.find((item) => item.id === videoId);

  if (video) {
    res.json(video);
  } else {
    res.status(404).json({ message: 'Video not found in the watchlist' });
  }
});

app.listen(port, () => {
  console.log(`Watchlist Service running on port ${port}`);
});
