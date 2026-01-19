import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useContext(AuthContext);

  return (
    <>
      <div style={{ padding: "15px", background: "#111", color: "white" }}>
        Attendance Tracker
        <button onClick={logout} style={{ float: "right" }}>
          Logout
        </button>
      </div>

      <div style={{ padding: "15px", background: "#111", color: "white" }}>
        <a href="/" style={{ margin: "0 10px", color: "white" }}>Home</a>
        <a href="/courses" style={{ margin: "0 10px", color: "white" }}>
          My Courses
        </a>
        <a href="/attendance" style={{ margin: "0 10px", color: "white" }}>
          Calendar
        </a>
      </div>
    </>
  );
}
