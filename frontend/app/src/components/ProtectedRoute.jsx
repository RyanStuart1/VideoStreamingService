import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/userContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) return <div className="card">Checking session…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
}
