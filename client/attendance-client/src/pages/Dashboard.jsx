import Navbar from "../components/Navbar";
import { useNavigate } from 'react-router-dom'
export default function Dashboard() {

  const navigate = useNavigate()

  const handleClick = (e) => {
    e.preventDefault()
    navigate('/courses')
  }
  return (
    <>
      <Navbar />
      <h1 style={{ padding: "20px" }}>Attendance Dashboard</h1>
      <button onClick={handleClick}>View Courses</button>
    </>
  );
}
