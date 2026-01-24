import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const { logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-brand">Attendance Tracker</div>

        <button className="navbar-logout" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/courses">My Courses</a>
        <a href="/attendance">Calendar</a>
      </div>
    </nav>
  );
}