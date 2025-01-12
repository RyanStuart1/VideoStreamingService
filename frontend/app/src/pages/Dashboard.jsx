import React, { useContext } from "react";
import { UserContext } from "../context/userContext";
import { Link } from "react-router-dom";

export default function Dashboard({ videos }) {
  const { user } = useContext(UserContext);

  return (
    <div>
      <h1>Dashboard</h1>
      {!!user && <h1>Hi {user.name}!</h1>}

      {/* Video List Section */}
      <div className="video-list" style={{ margin: "20px auto", padding: "10px" }}>
        <h3>Available Videos</h3>
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video._id}
              className="video-item"
              style={{
                cursor: "pointer",
                margin: "10px",
                padding: "10px",
                border: "1px solid red",
                borderRadius: "5px",
                display: "inline-block",
                color: "white",
                backgroundColor: "black",
              }}
            >
              <Link
                to={`/video/${video._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {video.title}
              </Link>
            </div>
          ))
        ) : (
          <p>No videos available.</p>
        )}
      </div>
    </div>
  );
}
