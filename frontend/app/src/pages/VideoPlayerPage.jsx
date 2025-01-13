import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VideoPlayerPage = () => {
  const { id } = useParams(); // Extract video ID from the URL
  const navigate = useNavigate(); // For navigating to different videos
  const [videos, setVideos] = useState([]); // List of all videos
  const [selectedVideo, setSelectedVideo] = useState(null); // Currently playing video
  const [loading, setLoading] = useState(false);

  // Fetch all videos and the selected video by ID
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Fetching video list...');
        const response = await axios.get('/videos');
        setVideos(response.data);
        console.log('Videos fetched:', response.data);
      } catch (err) {
        console.error('Failed to fetch video list:', err);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      setLoading(true);
      try {
        console.log('Requesting video with ID:', id);

        // Fetch the video metadata by ID
        const response = await axios.get(`/videos/${id}`);
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

    fetchVideo();
  }, [id]); // Refetch the video when the ID in the URL changes

  // Function to handle video selection
  const handleVideoSelect = (videoId) => {
    navigate(`/video/${videoId}`); // Update the URL to the selected video
  };

  return (
    <div style={{ display: 'flex', backgroundColor: 'black', color: 'red', padding: '20px' }}>
      {/* Video List Section */}
      <div style={{ width: '30%', overflowY: 'auto', paddingRight: '10px' }}>
        <h3>Available Videos</h3>
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video._id}
              className="video-item"
              style={{
                cursor: 'pointer',
                margin: '10px',
                padding: '10px',
                border: '1px solid red',
                borderRadius: '5px',
                color: 'white',
                backgroundColor: video._id === id ? '#333' : 'black', // Highlight the selected video
              }}
              onClick={() => handleVideoSelect(video._id)}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
              />
              <p>{video.title}</p>
            </div>
          ))
        ) : (
          <div>
            <p>No videos available</p>
            <a
              href="https://video-streaming-service-rs.s3.us-east-1.amazonaws.com/big_buck_bunny_1080p_h264.mp4"
              style={{ color: 'red', textDecoration: 'underline' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Click here to view a sample video
            </a>
          </div>
        )}
      </div>

      {/* Video Player Section */}
      <div style={{ width: '70%', textAlign: 'center' }}>
        {loading ? (
          <p>Loading video...</p>
        ) : selectedVideo ? (
          <div>
            <h2>{selectedVideo.title}</h2>
            <video controls width="100%" height="450">
              <source src={selectedVideo.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <p>Select a video to play</p>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerPage;
