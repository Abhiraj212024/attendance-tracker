import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toLocalISO } from "../../utils/date";
export default function CalendarPanel({
  selectedDate,
  onSelect,
  semester,
  monthData,
  onMonthChange
}) {
  return (
    <div className="calendar-left">
      <h2>Semester Calendar</h2>

      <Calendar
        value={selectedDate}
        onClickDay={onSelect}
        minDate={semester.start}
        maxDate={semester.end}

        onActiveStartDateChange={({ activeStartDate }) => {
          onMonthChange(activeStartDate);
          onSelect(activeStartDate);
        }}

        tileClassName={({ date }) => {
          const key = toLocalISO(date).split("T")[0];

          if (monthData?.[key]?.isHoliday) return "tile-holiday";
          if (monthData?.[key]) return "tile-filled";

          return null;
        }}
      />
    </div>
  );
}
