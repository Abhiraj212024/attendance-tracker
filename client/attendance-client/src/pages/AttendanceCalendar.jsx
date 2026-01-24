import { useState, useEffect, useMemo, useContext } from "react";
import CalendarPanel from "../components/calendar/CalendarPanel";
import DayEditor from "../components/calendar/DayEditor";
import "../styles/AttendanceCalendar.css";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { toLocalISO } from "../utils/date";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { AttendanceContext } from "../context/AttendanceContext"; // NEW IMPORT


const normalizeDay = (day) => {
  if (!day) return day;

  return {
    ...day,
    records: (day.records || [])
      .filter(Boolean)
      .map(r => ({
        ...r,
        course:
          typeof r.course === "object" && r.course !== null
            ? r.course
            : null
      }))
  };
};

// Add this improved toggleHoliday function to your AttendanceCalendar.jsx

const toggleHoliday = async (isHoliday) => {
  console.log('🔄 toggleHoliday called:', { 
    isHoliday, 
    currentDate: selectedDate.toISOString().split('T')[0],
    currentDayData: dayData 
  });

  if (isHoliday) {
    // Mark as holiday - clear records
    setDayData(prev => {
      const updated = {
        ...prev,
        isHoliday: true,
        records: []
      };
      console.log('✅ Setting holiday, new state:', updated);
      return updated;
    });
  } else {
    // Unmark holiday - rebuild from schedule
    console.log('🔄 Unmarking holiday, rebuilding...');
    await rebuildDay(selectedDate, dayData.overrideDay);
  }
};


export default function AttendanceCalendar() {
  const axiosPrivate = useAxiosPrivate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayData, setDayData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [monthData, setMonthData] = useState({});
  const [semester, setSemester] = useState(null);

  const { token } = useContext(AuthContext);
  const { triggerRefresh } = useContext(AttendanceContext); // NEW: Get refresh function

  const dirty = useMemo(() => {
    if (!dayData || !originalData) return false;
    return JSON.stringify(dayData) !== JSON.stringify(originalData);
  }, [dayData, originalData]);

  const fetchMonth = async (date) => {
    if(!semester || !token ) return;

    try {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const s = toLocalISO(start).split('T')[0];
      const e = toLocalISO(end).split('T')[0];

      const res = await axiosPrivate.get(`/attendance?start=${s}&end=${e}`);

      const map = {};
      res.data.forEach(element => {
        map[element.date] = element;
      });

      setMonthData(map);
    } catch (error) {
      console.error(error);
      setError("Failed to load month data");
    }
  };

  const handleDateSelect = async (date) => {
    if(!semester || !token ) return; 

    if (dirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }

    setSelectedDate(date);
    setLoading(true);
    setError(null);

    try {
      const iso = toLocalISO(date).split('T')[0];
      console.log('📅 Loading date:', iso); // DEBUG
      
      const res = await axiosPrivate.get(`/attendance/${iso}`);

      const normalized = normalizeDay(res.data);
      
      // ✅ SAFETY: Ensure date field matches what we requested
      if (normalized && !normalized.date) {
        normalized.date = iso;
      }
      
      console.log('✅ Loaded day:', normalized); // DEBUG

      setDayData(normalized);
      setOriginalData(normalized);
    } catch (error) {
      console.error(error);
      setError("Failed to load attendance data");
      setDayData(null);
      setOriginalData(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if(!token) return;

    const loadSemester = async () => {
      try {
        const res = await axiosPrivate.get('/semester');

        setSemester({
          start: new Date(res.data.semester.start + "T00:00:00"),
          end: new Date(res.data.semester.end + "T00:00:00")
        });
      } catch (error) {
        console.error(error);
        setError("Failed to get semester data");
      }
    };
    loadSemester();
  }, []);

  useEffect(() => {
    if(!semester || !token ) return;

    fetchMonth(selectedDate);
    handleDateSelect(selectedDate);

  }, [semester]);

  // Also update saveDay with better logging
  const saveDay = async () => {
    if (!dayData) return;

    setSaving(true);
    setError(null);

    const payload = {
      isHoliday: dayData.isHoliday,
      overrideDay: dayData.overrideDay,
      records: dayData.records
        .filter(rec => rec.course) 
        .map(rec => ({
          course: rec.course._id || rec.course,
          status: rec.status,
          count: rec.count
        }))
    };

    console.log('💾 SAVING DAY');
    console.log('Date:', dayData.date);
    console.log('Selected Date:', selectedDate.toISOString().split('T')[0]);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      if (dayData._id) {
        console.log('📝 Updating existing day via PUT');
        await axiosPrivate.put(`/attendance/${dayData.date}`, payload);
      } else {
        console.log('➕ Creating new day via POST');
        await axiosPrivate.post('/attendance', {
          date: dayData.date,
          ...payload
        });
      }

      setOriginalData(dayData);
      await fetchMonth(selectedDate);
      triggerRefresh();
      
      console.log('✅ Save successful');
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      console.error('Error response:', error.response?.data);
      setError("Failed to save attendance data");
    } finally {
      setSaving(false);
    }
  };

  const rebuildDay = async (date, overrideDay) => {
    setLoading(true);
    setError(null);

    try {
      const iso = toLocalISO(date).split("T")[0];
      
      const res = await axiosPrivate.post(`/attendance/${iso}/rebuild`, {
        overrideDay
      });
      
      const rebuilt = {
        ...res.data,
        overrideDay
      };

      const normalized = normalizeDay(rebuilt);

      setDayData(normalized);
      setOriginalData(normalized);
    } catch (e) {
      console.error(e);
      setError("Failed to rebuild day data");
    } finally {
      setLoading(false);
    }
  };

  const toggleHoliday = async (isHoliday) => {
    if(isHoliday) {
      setDayData(prev => ({
        ...prev,
        isHoliday: true,
        records: []
      }));
    } else {
      await rebuildDay(selectedDate, dayData.overrideDay);
    }
  };

  if (!semester) {
    return (
      <>
        <Navbar />
        <div className="calendar-page">
          <div className="calendar-right">Loading semester...</div>
        </div>
      </>
    );
  }

  console.log("Semester Start:", semester.start, "End:", semester.end);

  return (
    <>
      <Navbar />
      
      <div className="calendar-page">
        {error && <div className="error-banner">{error}</div>}
        
        <CalendarPanel
          selectedDate={selectedDate}
          onSelect={handleDateSelect}
          semester={semester}
          monthData={monthData}
          onMonthChange={fetchMonth}
        />

        <DayEditor
          selectedDate={selectedDate}
          dayData={dayData}
          setDayData={setDayData}
          loading={loading}
          saving={saving}
          dirty={dirty}
          onSave={saveDay}
          onOverrideChange={(overrideDay) => rebuildDay(selectedDate, overrideDay)}
          onHolidayChange={toggleHoliday}
        />
      </div>
    </>
  );
}