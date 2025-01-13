import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';
import { UserContextProvider } from './context/userContext';
import VideoPlayerPage from './pages/VideoPlayerPage';

// Use the environment variable that Create React App provides at build time:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://98.85.96.246:3003/api';

// Set Axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  const [users, setUsers] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate(); // For programmatic navigation

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        console.log('Fetching users and watchlist data...');
        const usersResponse = await axios.get('/users');
        setUsers(usersResponse.data);

        const watchlistResponse = await axios.get('/watchlist');
        setWatchlist(watchlistResponse.data);

        console.log('Data fetched successfully');
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="App" style={{ backgroundColor: 'black', color: 'red', textAlign: 'center' }}>
      {isFetching ? (
        <p>Loading data...</p>
      ) : (
        <>
          <UserContextProvider>
            <Navbar />
            <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/videoplayer" element={<VideoPlayerPage />} />
            </Routes>
          </UserContextProvider>

          {/* Navigation Section with a Button */}
          <div>
            <button
              style={{
                padding: '10px 20px',
                margin: '20px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: 'red',
                color: 'white',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/videoplayer')} // Navigates to the video player page
            >
              Go to Video Player
            </button>
          </div>

          {/* Users Section */}
          <h2>Username</h2>
          <ul className="users-list">
            {users.map((user) => (
              <li key={user.id}>
                {user.name} ({user.email})
              </li>
            ))}
          </ul>

          {/* Watchlist Section */}
          <h1>Watchlist</h1>
          <ul className="watchlist">
            {watchlist.map((item) => (
              <li key={item.id}>
                {item.title} - Status: {item.status}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
