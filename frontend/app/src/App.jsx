import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import VideoListPage from './pages/VideoListPage';

// 1) Remove any inline REACT_APP_API_URL= '...' lines. 
//    Instead, read from environment variables:

// Use the environment variable that Create React App provides at build time:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://98.85.96.246:3003/api';

// 2) Set Axios defaults (with baseURL if you prefer):
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        console.log('Fetching users, videos, and watchlist data...');

        // Because we set axios.defaults.baseURL above,
        // we can just do '/users' instead of the full URL:
        const usersResponse = await axios.get('/users');
        setUsers(usersResponse.data);

        const videosResponse = await axios.get('/videos');
        setVideos(videosResponse.data);

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

  // Function to start streaming a video
  const startStream = async (videoId) => {
    const trimmedVideoId = videoId.trim();
    console.log('Requesting video with ID:', trimmedVideoId);

    setLoading(true);
    try {
      // We'll call `/videos/${trimmedVideoId}` instead of `/api/videos/${trimmedVideoId}`
      // because our base URL is already /api if your REACT_APP_API_URL is set to /api at the end.
      const response = await axios.get(`/videos/${trimmedVideoId}`);
      const videoData = response.data;
      console.log('Video metadata received:', videoData);

      setSelectedVideo({
        id: videoData._id,
        title: videoData.title,
        url: videoData.url, 
      });
    } catch (err) {
      console.error('Failed to load video metadata:', err);
      if (err.response && err.response.status === 404) {
        alert('Video not found. Please select another video.');
      } else {
        alert('Failed to load video. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ backgroundColor: 'black', color: 'red', textAlign: 'center' }}>
      {isFetching ? (
        <p>Loading data...</p>
      ) : (
        <>
          <UserContextProvider>
            <Navbar />
            <Toaster position='bottom-right' toastOptions={{ duration: 2000 }} />
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/register' element={<Register />} />
              <Route path='/login' element={<Login />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path="/video/:id" element={<VideoPlayerPage />} />
              <Route path="/videos" element={<VideoListPage videos={videos} />} />
            </Routes>
          </UserContextProvider>

          {/* Users Section */}
          <h1>Users</h1>
          <ul className="users-list">
            {users.map((user) => (
              <li key={user.id}>
                {user.name} ({user.email})
              </li>
            ))}
          </ul>

          {/* Video Streaming Section */}
          <h1>Video Streaming Application</h1>
          {selectedVideo && (
            <div className="video-player" style={{ margin: '20px auto' }}>
              <h2>{selectedVideo.title}</h2>
              <video key={selectedVideo.id}controls width="800" height="450">
                <source src={selectedVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) (
            <p>Select a video to play</p>
          )}

          {/* Video List */}
          <div className="video-list" style={{ margin: '20px auto', padding: '10px' }}>
            <h3>Available Videos</h3>
            {videos.map((video) => (
              <div
                key={video._id}
                className="video-item"
                style={{
                  cursor: 'pointer',
                  margin: '10px',
                  padding: '10px',
                  border: '1px solid red',
                  borderRadius: '5px',
                  display: 'inline-block',
                  color: 'white',
                  backgroundColor: 'black',
                }}
                onClick={() => startStream(video._id)}>
                  <img src ={video.thumbnail} alt={video.title} />
                <p>{video.title}</p>
              </div>
            ))}
          </div>

          {/* Loading Indicator */}
          {loading && <p>Loading video...</p>}

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