export default function CourseCard({ course, onEdit, onDelete }) {
  return (
    <div className="course-card">
      <div className="course-card-header">
        <h3>{course.code}</h3>
        <p>{course.name}</p>
      </div>

      <div className="course-schedule">
        {Object.entries(course.schedule).map(([day, count]) => (
          <div key={day} className="schedule-chip">
            <span>{day.slice(0,3)}</span>
            <b>{count}</b>
          </div>
        ))}
      </div>

      <div className="course-actions">
        <button className="edit-btn" onClick={() => onEdit(course._id)}>
          Edit
        </button>
        <button className="delete-btn" onClick={() => onDelete(course._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}