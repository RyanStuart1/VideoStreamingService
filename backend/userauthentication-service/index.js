const express = require('express');
const app = express();
const port = 3000;

const users = [
  { id: 1, name: 'Ryan Stuart', email: 'ryanstuart911@gmail.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];  

app.get('/users', (req, res) => {
  res.json(users);
});  

app.listen(port, () => {
  console.log(`User Service running on port ${port}`);
});