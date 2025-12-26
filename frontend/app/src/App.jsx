import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import Account from "./pages/Account";

import { Toaster } from "react-hot-toast";
import { UserContextProvider } from "./context/userContext";
import { useUser } from "./context/userContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Better default for local dev
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3003/api";
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Redirect /video to the first available video
function VideoIndexRedirect({ videos, videosLoading }) {
  if (videosLoading) return <div className="card">Loading videos…</div>;
  if (!videos || videos.length === 0) return <div className="card">No videos available.</div>;
  return <Navigate to={`/video/${videos[0]._id}`} replace />;
}

function AppRoutes() {
  const { user, loading } = useUser();
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const run = async () => {
      setVideosLoading(true);
      try {
        const res = await axios.get("/videos");
        setVideos(res.data || []);
      } catch (e) {
        console.error("Failed to fetch videos:", e);
        setVideos([]);
      } finally {
        setVideosLoading(false);
      }
    };

    run();
  }, [user]);

  if (loading) return <div className="card">Checking session…</div>;

  return (
    <Routes>
      {/* Root: send logged-in users to dashboard, everyone else to login */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      {/* Optional public home */}
      <Route path="/home" element={<Home />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard videos={videos} videosLoading={videosLoading} />
          </ProtectedRoute>
        }
      />

      {/* /video -> auto-select first video */}
      <Route
        path="/video"
        element={
          <ProtectedRoute>
            <VideoIndexRedirect videos={videos} videosLoading={videosLoading} />
          </ProtectedRoute>
        }
      />

      {/* /video/:id -> player */}
      <Route
        path="/video/:id"
        element={
          <ProtectedRoute>
            <VideoPlayerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="appShell">
      <UserContextProvider>
        <Navbar />
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
        <div className="container">
          <AppRoutes />
        </div>
      </UserContextProvider>
    </div>
  );
}
