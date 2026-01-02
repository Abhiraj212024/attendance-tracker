import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useContext(AuthContext);

  return (
    <div style={{ padding: "15px", background: "#111", color: "white" }}>
      Attendance Tracker
      <button onClick={logout} style={{ float: "right" }}>
        Logout
      </button>
    </div>
  );
}
