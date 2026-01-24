import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MyCourses from "./pages/MyCourses";
import AttendanceCalendar from "./pages/AttendanceCalendar";
import { AttendanceProvider } from "./context/AttendanceContext"; // NEW IMPORT

export default function App() {
  return (
    <BrowserRouter>
      <AttendanceProvider> {/* NEW: Wrap routes with provider */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/courses' element={<MyCourses />} />
          <Route path='/attendance' element={<AttendanceCalendar />}/>

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AttendanceProvider> {/* NEW: Close provider */}
    </BrowserRouter>
  );
}