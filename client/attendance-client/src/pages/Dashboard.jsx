import Navbar from "../components/Navbar";
import { useNavigate } from 'react-router-dom'
export default function Dashboard() {

  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <h1 style={{ padding: "20px" }}>Attendance Dashboard</h1>
    </>
  );
}
