import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav>
      <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
      <Link to="/register" style={{ marginRight: '15px' }}>Register</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}
