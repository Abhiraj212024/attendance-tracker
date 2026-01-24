import DayControls from "./DayControls";
import AttendanceRow from "./AttendanceRow";

export default function DayEditor({
  selectedDate,
  dayData,
  setDayData,
  loading,
  saving,
  dirty,
  onSave,
  onOverrideChange,
  onHolidayChange
}) {
  if (loading) return <div className="calendar-right">Loading...</div>;

  if (!dayData) {
    return (
      <div className="calendar-right">
        <h2>{selectedDate.toDateString()}</h2>
        <p>Select a date to mark attendance.</p>
      </div>
    );
  }

  // ✅ FIX: Update record by course ID, not by index
  const handleRecordChange = (courseId, updatedRecord) => {
    setDayData(prev => ({
      ...prev,
      records: prev.records.map(rec => 
        (rec.course?._id || rec.course) === courseId
          ? updatedRecord
          : rec
      )
    }));
  };

  return (
    <div className="calendar-right">
      <h2>{selectedDate.toDateString()}</h2>

      <DayControls
        dayData={dayData}
        setDayData={setDayData}
        onOverrideChange={onOverrideChange}
        onHolidayChange={onHolidayChange}
      />

      {dayData.isHoliday ? (
        <p className="holiday-banner">Holiday – no classes</p>
      ) : (
        <div className="records-list">
          {dayData.records
            .filter(rec => rec.course)
            .map((rec) => (
              <AttendanceRow
                key={rec.course._id}  // ✅ FIX: Use course ID as key, not index
                record={rec}
                disabled={dayData.isHoliday}
                onChange={(updated) => {
                  // ✅ FIX: Pass course ID instead of relying on index
                  handleRecordChange(rec.course._id, updated);
                }}
              />
            ))}
        </div>
      )}

      <button
        className="save-btn"
        disabled={!dirty || saving}
        onClick={onSave}
      >
        {saving ? "Saving..." : dirty ? "Save changes" : "Saved"}
      </button>
    </div>
  );
}