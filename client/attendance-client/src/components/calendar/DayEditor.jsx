import DayControls from "./DayControls";
import AttendanceRow from "./AttendanceRow";

export default function DayEditor({
  selectedDate,
  dayData,
  setDayData,
  loading,
  saving, // NEW: Accept saving prop
  dirty, // NEW: Accept dirty prop
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
        <p className="holiday-banner">Holiday — no classes</p>
      ) : (
        <div className="records-list">
          {dayData.records.map((rec, idx) => (
            <AttendanceRow
              key={rec.course._id || rec.course}
              record={rec}
              disabled={dayData.isHoliday} // NEW: Disable when holiday
              onChange={(updated) => {
                const copy = [...dayData.records];
                copy[idx] = updated;
                setDayData({ ...dayData, records: copy });
              }}
            />
          ))}
        </div>
      )}

      <button
        className="save-btn"
        disabled={!dirty || saving} // FIXED: Use passed props
        onClick={onSave}
      >
        {saving ? "Saving..." : dirty ? "Save changes" : "Saved"} 
        {/* NEW: Show saving state */}
      </button>
    </div>
  );
}