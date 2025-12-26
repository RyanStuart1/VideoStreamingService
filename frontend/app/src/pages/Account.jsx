import React, { useContext } from "react";
import { UserContext } from "../context/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // If your gateway has /logout, call it. If not, you can skip this call
      await axios.post("/logout");
    } catch (e) {
      // ok if you haven't implemented logout endpoint yet
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="card" style={{ maxWidth: 720, margin: "20px auto" }}>
      <h1 style={{ marginTop: 0 }}>My Account</h1>

      {!user ? (
        <p>You are not logged in.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Name</div>
              <div style={{ fontWeight: 800 }}>{user.name}</div>
            </div>

            <div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Email</div>
              <div style={{ fontWeight: 800 }}>{user.email}</div>
            </div>
          </div>

          <hr style={{ margin: "18px 0", opacity: 0.2 }} />

          <button className="nfBtn nfBtnPrimary" onClick={handleLogout}>
            Log out
          </button>
        </>
      )}
    </div>
  );
}
