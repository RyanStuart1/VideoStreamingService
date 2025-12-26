import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { UserContext } from "../context/userContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const { setUser } = useContext(UserContext);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();
    const { email, password } = data;

    setSubmitting(true);
    try {
      const res = await axios.post("/login", { email, password });

      if (res.data?.error) {
        toast.error(res.data.error);
        return;
      }

      // If your API returns the user object on login, store it
      // If it doesn't, we can fetch /profile after login to populate context
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        try {
          const profileRes = await axios.get("/profile");
          setUser(profileRes.data);
        } catch {
          // If profile fails, still navigate; protected routes will handle it
        }
      }

      toast.success("Logged in!");
      setData({ email: "", password: "" });

      // ✅ go where the user intended (or /dashboard)
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <h1>Welcome back</h1>
          <p>Log in to continue streaming.</p>
        </div>

        <form className="authForm" onSubmit={loginUser}>
          <label className="authLabel" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="authInput"
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            autoComplete="email"
            required
          />

          <label className="authLabel" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="authInput"
            type="password"
            placeholder="••••••••"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            autoComplete="current-password"
            required
          />

          <button className="authButton" type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="authFooter">
          <span>New here?</span>
          <Link to="/register" className="authLink">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
