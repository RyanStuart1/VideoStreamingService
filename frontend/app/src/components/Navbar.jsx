import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";

export default function Navbar() {
  const { user } = useContext(UserContext);

  return (
    <nav className="navbar">
      {/* Left: Logo / Home */}
      <div className="navbar-left">
        <NavLink to={user ? "/dashboard" : "/login"} className="navbar-logo">
          StreamBox
        </NavLink>
      </div>

      {/* Right: Actions */}
      <div className="navbar-right">
        {user && (
          <>
            <NavLink to="/account" className="nav-btn ghost">
              My Account
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
