import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get('/api/users');
        setUsers(usersResponse.data);

        const videosResponse = await axios.get('api/videos');
        setVideos(videosResponse.data);

        const watchlistResponse = await axios.get('/api/watchlist');
        setWatchlist(watchlistResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="App">
      {/* Users Section */}
      <h1>Users</h1>
      <ul className="users-list">
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>

      {/* Video Player Section */}
      <h1>Video Streaming Application</h1>
      {selectedVideo && (
        <div className="video-player">
          <h2>{selectedVideo.title}</h2>
          <video controls width="800" height="450">
            <source src={selectedVideo.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Video List */}
      <div className="video-list">
        <h3>Available Videos</h3>
        {videos.map((video) => (
          <div
            key={video.id}
            className="video-item"
            onClick={() => setSelectedVideo(video)} // Update selectedVideo on click
          >
            {video.title}
          </div>
        ))}
      </div>

      {/* Watchlist Section */}
      <h1>Watchlist</h1>
      <ul className="watchlist">
        {watchlist.map((item) => (
          <li key={item.id}>
            {item.title} - Status: {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
