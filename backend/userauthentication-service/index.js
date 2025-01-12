const express = require('express');
require('dotenv').config();
const app = express();
const port = 3000;
const {mongoose} = require('mongoose')
const cookieParser = require('cookie-parser')

// database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('User DB connected'))
.catch((err) => console.log('Database not connected', err))

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))

app.use('/', require('./routes/authRoutes'))

app.get('/users', (req, res) => {
  res.json(users);
});  

app.listen(port, () => {
  console.log(`User Service running on port ${port}`);
});

const users = [
  { id: 1, name: 'Ryan Stuart', email: 'ryanstuart911@gmail.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];  
