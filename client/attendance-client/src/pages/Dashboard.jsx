import { useEffect, useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { AttendanceContext } from "../context/AttendanceContext"; // NEW IMPORT
import "../styles/Dashboard.css";

export default function Dashboard() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshTrigger } = useContext(AttendanceContext); // NEW: Listen for changes

  const [semester, setSemester] = useState(null);
  const [draft, setDraft] = useState({ start: "", end: "" });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSemester, setSavingSemester] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const semRes = await axiosPrivate.get("/semester");

        if (semRes.data.semester) {
          setSemester(semRes.data.semester);
          await loadDashboard(semRes.data.semester);
        }

      } catch (e) {
        console.error(e);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [location.pathname, refreshTrigger]); // NEW: Added refreshTrigger dependency

  const loadDashboard = async (sem) => {
    if (!sem?.start || !sem?.end) return;
    const res = await axiosPrivate.get(
      `/attendance/dashboard?start=${sem.start}&end=${sem.end}`
    );

    setCourses(res.data.courses || []);
  };

  const saveSemester = async () => {
    if (!draft.start || !draft.end) {
      alert("Please select both start and end dates");
      return;
    }

    if (draft.start > draft.end) {
      alert("Start date must be before end date");
      return;
    }

    try {
      setSavingSemester(true);

      const res = await axiosPrivate.post("/semester", draft);
      setSemester(res.data.semester);
      if(res.data?.semester){
        await loadDashboard(res.data.semester);
      }

      setDraft({ start: "", end: "" });

    } catch (e) {
      console.error(e);
      alert("Failed to save semester");
    } finally {
      setSavingSemester(false);
    }
  };

  const resetSemester = () => {
    setSemester(null);
    setCourses([]);
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-page">
        <h1>Attendance Dashboard</h1>

        {loading && <p>Loading dashboard...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && (
          <section className="semester-section">
            {!semester ? (
              <div className="semester-card">
                <h2>Set semester duration</h2>

                <div className="semester-form">
                  <label>
                    Start date
                    <input
                      type="date"
                      value={draft.start}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, start: e.target.value }))
                      }
                    />
                  </label>

                  <label>
                    End date
                    <input
                      type="date"
                      value={draft.end}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, end: e.target.value }))
                      }
                    />
                  </label>

                  <button onClick={saveSemester} disabled={savingSemester}>
                    {savingSemester ? "Saving..." : "Save semester"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="semester-summary">
                <div>
                  <h2>Semester</h2>
                  <p>{semester.start} → {semester.end}</p>
                </div>

                <button onClick={resetSemester}>
                  Change semester
                </button>
              </div>
            )}
          </section>
        )}

        {!loading && semester && (
          <section className="courses-section">
            <h2>Your courses</h2>

            <div className="course-grid">
              {courses.length === 0 ? (
                <p>No attendance data yet.</p>
              ) : (
                courses.map((course) => (
                  <CourseCard key={course.courseId} course={course} />
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function CourseCard({ course }) {
  return (
    <div className="course-card">
      <div className="course-header">
        <h3>{course.code}</h3>
        <p>{course.name}</p>
      </div>

      <div className="course-metrics">
        <div>
          <span className="metric-label">Attended</span>
          <span className="metric-value">
            {course.attended} / {course.total}
          </span>
        </div>

        <div>
          <span className="metric-label">Missed</span>
          <span className="metric-value">
            {course.missed}
          </span>
        </div>

        <div>
          <span className="metric-label">Cancelled</span>
          <span className="metric-value">
            {course.cancelled}  {/* FIX: Changed from course.missed to course.cancelled */}
          </span>
        </div>

        <div>
          <span className="metric-label">Max Possible Attendance Days</span>
          <span className="metric-value">
            {course.maxAttended}
          </span>
        </div>

        <div>
          <span className="metric-label">Max Total Days</span>
          <span className="metric-value">
            {course.maxTotal}
          </span>
        </div>

        <div>
          <span className="metric-label">Current %</span>
          <span className="metric-value">
            {Number(course.currentPercentage ?? 0).toFixed(2)}%
          </span>
        </div>

        <div>
          <span className="metric-label">Max possible %</span>
          <span className="metric-value">
            {Number(course.maxPossiblePercentage ?? 0).toFixed(2)}%
          </span>
        </div>
      </div>

      <ProgressBar percent={course.currentPercentage} />
    </div>
  );
}

function ProgressBar({ percent }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}