import { useState, useEffect, useMemo } from "react";
import CalendarPanel from "../components/calendar/CalendarPanel";
import DayEditor from "../components/calendar/DayEditor";
import "../styles/AttendanceCalendar.css";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { toLocalISO } from "../utils/date";
import Navbar from "../components/Navbar";

export default function AttendanceCalendar() {
  const axiosPrivate = useAxiosPrivate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayData, setDayData] = useState(null);
  const [originalData, setOriginalData] = useState(null); // NEW: Track original data
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // NEW: Track save state
  const [error, setError] = useState(null); // NEW: Track errors
  const [monthData, setMonthData] = useState({});

  // mock semester (later from backend)
  const semester = {
    start: new Date(2026, 0, 5),
    end: new Date(2026, 4, 10)
  };

  // NEW: Calculate dirty state
const dirty = useMemo(() => {
    if (!dayData || !originalData) return false;
    return JSON.stringify(dayData) !== JSON.stringify(originalData);
  }, [dayData, originalData]);

  const fetchMonth = async (date) => {
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
      setError("Failed to load month data"); // NEW: User feedback
    }
  };

  const handleDateSelect = async (date) => {
    // NEW: Warn if unsaved changes
    if (dirty && !window.confirm("You have unsaved changes. Continue?")) {
      return;
    }

    setSelectedDate(date);
    setLoading(true);
    setError(null); // NEW: Clear previous errors

    try {
      const iso = toLocalISO(date).split('T')[0];
      const res = await axiosPrivate.get(`/attendance/${iso}`);

      setDayData(res.data);
      setOriginalData(res.data); // NEW: Set original data for dirty tracking
    } catch (error) {
      console.error(error);
      setError("Failed to load attendance data"); // NEW: User feedback
      setDayData(null);
      setOriginalData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonth(selectedDate);
    handleDateSelect(selectedDate);
  }, []);

  const saveDay = async () => {
    if (!dayData) return;
    
    setSaving(true); // NEW: Set saving state
    setError(null); // NEW: Clear previous errors

    const payload = {
      isHoliday: dayData.isHoliday,
      overrideDay: dayData.overrideDay,
      records: dayData.records.map(rec => ({
        course: rec.course._id || rec.course, // FIXED: Handle both formats
        status: rec.status,
        count: rec.count
      }))
    };

    try {
      if (dayData._id) {
        await axiosPrivate.put(`/attendance/${dayData.date}`, payload);
      } else {
        await axiosPrivate.post('/attendance', {
          date: dayData.date,
          ...payload
        });
      }

      // NEW: Update original data after successful save
      setOriginalData(dayData);
      await fetchMonth(selectedDate);
    } catch (error) {
      console.error(error);
      setError("Failed to save attendance data"); // NEW: User feedback
    } finally {
      setSaving(false); // NEW: Clear saving state
    }
  };

  const rebuildDay = async (date, overrideDay) => {
    setLoading(true);
    setError(null); // NEW: Clear previous errors

    try {
      const iso = toLocalISO(date).split("T")[0];
      
      // FIXED: Fetch fresh data with override parameter
      const res = await axiosPrivate.post(`/attendance/${iso}/rebuild`, {
        overrideDay
      });
      
      const rebuilt = {
        ...res.data,
        overrideDay
      };

      setDayData(rebuilt);
      setOriginalData(rebuilt); // NEW: Update original data
    } catch (e) {
      console.error(e);
      setError("Failed to rebuild day data"); // NEW: User feedback
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
      }))
    } else {
      await rebuildDay(selectedDate, dayData.overrideDay)
    }
  }

  return (
    <>
      <Navbar />
      
      <div className="calendar-page">
        {error && <div className="error-banner">{error}</div>} {/* NEW: Error display */}
        
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
          saving={saving} // NEW: Pass saving state
          dirty={dirty} // NEW: Pass dirty state
          onSave={saveDay}
          onOverrideChange={(overrideDay) => rebuildDay(selectedDate, overrideDay)}
          onHolidayChange={toggleHoliday}
        />
      </div>
    </>
  );
}