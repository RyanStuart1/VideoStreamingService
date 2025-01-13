import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "black",
        borderBottom: "1px solid red",
      }}
    >
      {/* Home button on the left */}
      <div>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            padding: "5px 10px",
            border: "1px solid red",
            borderRadius: "5px",
          }}
        >
          Home
        </Link>
      </div>

      {/* Register and Login buttons on the right */}
      <div>
        <Link
          to="/register"
          style={{
            color: "white",
            textDecoration: "none",
            padding: "5px 10px",
            border: "1px solid red",
            borderRadius: "5px",
            marginRight: "10px",
          }}
        >
          Register
        </Link>
        <Link
          to="/login"
          style={{
            color: "white",
            textDecoration: "none",
            padding: "5px 10px",
            border: "1px solid red",
            borderRadius: "5px",
          }}
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
