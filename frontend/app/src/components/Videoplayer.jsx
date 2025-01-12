import React from 'react';

const VideoPlayer = ({ selectedVideo }) => {
  if (!selectedVideo) {
    return <p>Select a video to play</p>;
  }

  return (
    <div className="video-player" style={{ margin: '20px auto' }}>
      <h2>{selectedVideo.title}</h2>
      <video controls width="800" height="450">
        <source src={selectedVideo.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
