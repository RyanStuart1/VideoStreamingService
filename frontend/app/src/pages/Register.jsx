import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const registerUser = async (e) => {
    e.preventDefault();
    const { name, email, password } = data;

    setSubmitting(true);
    try {
      const res = await axios.post("/register", { name, email, password });

      if (res.data?.error) {
        toast.error(res.data.error);
      } else {
        toast.success("Account created — please log in");
        setData({ name: "", email: "", password: "" });
        navigate("/login");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <h1>Create account</h1>
          <p>Join and start streaming.</p>
        </div>

        <form className="authForm" onSubmit={registerUser}>
          <label className="authLabel" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="authInput"
            type="text"
            placeholder="Your name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            autoComplete="name"
            required
          />

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
            autoComplete="new-password"
            minLength={6}
            required
          />

          <button className="authButton" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="authFooter">
          <span>Already have an account?</span>
          <Link to="/login" className="authLink">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
