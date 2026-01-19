import Navbar from "../components/Navbar";
import { useNavigate } from 'react-router-dom'
export default function Dashboard() {

  const navigate = useNavigate()

  const handleClickCourses = (e) => {
    e.preventDefault()
    navigate('/courses')
  }
  const handleClickAttendance = (e) => {
    e.preventDefault()
    navigate('/attendance')
  }
  return (
    <>
      <Navbar />
      <h1 style={{ padding: "20px" }}>Attendance Dashboard</h1>
      <button onClick={handleClickCourses}>View Courses</button>
      <button onClick={handleClickAttendance}>View Attendance</button>
    </>
  );
}
