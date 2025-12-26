import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const FALLBACK_POSTER =
  "/placeholder.png";

export default function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // Fetch list
  useEffect(() => {
    const fetchVideos = async () => {
      setLoadingList(true);
      try {
        const res = await axios.get("/videos");
        setVideos(res.data || []);
      } catch (err) {
        console.error("Failed to fetch video list:", err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchVideos();
  }, []);

  // Fetch selected video metadata
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) {
        setSelectedVideo(null);
        return;
      }
      setLoadingVideo(true);
      try {
        const res = await axios.get(`/videos/${id}`);
        const v = res.data;

        setSelectedVideo({
          _id: v._id,
          title: v.title,
          url: v.url,
          thumbnail: v.thumbnail,
        });
      } catch (err) {
        console.error("Failed to load video metadata:", err);
        setSelectedVideo(null);
      } finally {
        setLoadingVideo(false);
      }
    };
    fetchVideo();
  }, [id]);

  const sidebarItems = useMemo(() => videos || [], [videos]);

  const handleSelect = (videoId) => navigate(`/video/${videoId}`);

  return (
    <div className="vp">
      {/* Left rail */}
      <aside className="vpRail">
        <div className="vpRailHeader">
          <div>
            <div className="vpRailTitle">Browse</div>
            <div className="vpRailSub">Pick something to watch</div>
          </div>
        </div>

        {loadingList ? (
          <div className="vpRailCard">Loading library…</div>
        ) : sidebarItems.length === 0 ? (
          <div className="vpRailCard">
            <div>No videos available.</div>
            <a
              className="vpLink"
              href="https://video-streaming-service-rs.s3.us-east-1.amazonaws.com/big_buck_bunny_1080p_h264.mp4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open sample video
            </a>
          </div>
        ) : (
          <div className="vpList">
            {sidebarItems.map((v) => {
              const active = String(v._id) === String(id);
              return (
                <button
                  key={v._id}
                  className={`vpItem ${active ? "isActive" : ""}`}
                  onClick={() => handleSelect(v._id)}
                >
                  <img
                    className="vpThumb"
                    src={v.thumbnail || FALLBACK_POSTER}
                    alt={v.title}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_POSTER;
                    }}
                  />
                  <div className="vpMeta">
                    <div className="vpTitle">{v.title}</div>
                    <div className="vpHint">{active ? "Now playing" : "Play"}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Player */}
      <main className="vpMain">
        {loadingVideo ? (
          <div className="vpStage vpCenter">
            <div className="vpSpinner" />
            <div className="vpMuted">Loading video…</div>
          </div>
        ) : selectedVideo ? (
          <div className="vpStage">
            <div className="vpTop">
              <div>
                <div className="vpNowPlaying">NOW PLAYING</div>
                <h1 className="vpH1">{selectedVideo.title}</h1>
              </div>
            </div>

            <div className="vpPlayerWrap">
              <video
                className="vpVideo"
                controls
                playsInline
                poster={selectedVideo.thumbnail || FALLBACK_POSTER}
              >
                <source src={selectedVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        ) : (
          <div className="vpStage vpCenter">
            <div className="vpEmptyTitle">Select a video</div>
            <div className="vpMuted">Choose something from the left to start playing.</div>
          </div>
        )}
      </main>
    </div>
  );
}
