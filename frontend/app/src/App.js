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

        const videosResponse = await axios.get('/api/videos');
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
    <div className="App" style={{ backgroundColor: 'black', color: 'red', textAlign: 'center' }}>
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
      {selectedVideo ? (
        <div className="video-player" style={{ margin: '20px auto' }}>
          <h2>{selectedVideo.title}</h2>
          <video controls width="800" height="450">
            <source src={selectedVideo.url} type="application/x-mpegURL" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <p>Select a video to play</p>
      )}

      {/* Video List */}
      <div className="video-list" style={{ margin: '20px auto', padding: '10px' }}>
        <h3>Available Videos</h3>
        {videos.map((video) => (
          <div
            key={video.id}
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
            onClick={() => setSelectedVideo(video)} // Set the selected video
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
