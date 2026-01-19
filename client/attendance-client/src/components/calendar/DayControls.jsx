export default function DayControls({ dayData, onOverrideChange, onHolidayChange }) {
  return (
    <div className="day-controls">
      <label>
        <input
          type="checkbox"
          checked={dayData.isHoliday}
          onChange={(e) => {
            const isHoliday = e.target.checked;
            onHolidayChange(isHoliday); 
          }}
        />
        Mark as holiday
      </label>

      <div>
        Override timetable:
        <select
          value={dayData.overrideDay || ""}
          onChange={(e) => onOverrideChange(e.target.value || null)}
          disabled={dayData.isHoliday} // NEW: Disable when holiday
        >
          <option value="">None</option>
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
          <option value="friday">Friday</option>
        </select>
      </div>
    </div>
  );
}