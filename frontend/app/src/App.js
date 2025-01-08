import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get('/api/users');
        setUsers(usersResponse.data);

        const videosResponse = await axios.get('/api/videos');
        setVideos(videosResponse.data);

        const watchlistResponse = await axios.get('/api/watchlist');
        setWatchlist(watchlistResponse.data);

        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>; 
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>

      <h1>Videos</h1>
      {videos.map(video => (
        <div key={video.id}>
          <h2>{video.title}</h2>
          <video width={800} height={500} controls loop autoPlay muted>
          <source src={`/videos/${video.filename}`} type="video/mp4" />
          </video>
        </div>
      ))}

      <h1>Watchlist</h1>
      <ul>
        {watchlist.map(item => (
          <li key={item.id}>{item.title} - Status: {item.status}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
