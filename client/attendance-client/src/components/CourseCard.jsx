export default function CourseCard({ course, onEdit, onDelete }) {
    return (
        <div className='card'>
            <h3>{course.code} - {course.name}</h3>
            <ul>
                {Object.entries(course.schedule).map(([day, count]) => (
                    <li key={day}>
                        {day}: {count}
                    </li>
                ))}
            </ul>
            <button onClick={() => onEdit(course._id)}>Edit</button>
            <button onClick={() => onDelete(course._id)}>Delete</button>
        </div>
    )
}