export default function AttendanceRow({ record, onChange, disabled }) {
  return (
    <div className={`attendance-row ${disabled ? "disabled" : ""}`}>
      <span>
        {record.course.code} - {record.course.name} ({record.count})
      </span>

      <select
        value={record.status}
        disabled={disabled}
        onChange={(e) =>
          onChange({ ...record, status: e.target.value })
        }
      >
        <option value="attended">Attended</option>
        <option value="missed">Missed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
