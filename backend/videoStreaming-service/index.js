const express = require('express');
const app = express();
const port = 3001;  

const videos = [
  { id: 1,
    title: 'FreeVideo',
    thumbnail: 'aws link',
    url: ''
  },
  { id: 2, 
    title: 'Microservices with Node.js', 
    thumbnail: 'aws link', 
    url: '' 
  },
];  
 
app.get('/videos', (req, res) => {
  res.json(videos);
});  

app.listen(port, () => {
  console.log(`Video Service running on port ${port}`);
});