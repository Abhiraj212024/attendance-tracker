import { useEffect, useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import CourseCard from '../components/CourseCard'
import '../styles/MyCourses.css'
import Navbar from '../components/Navbar'

export default function MyCourses(){
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const axiosPrivate = useAxiosPrivate()
    const emptySchedule = {
        monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0
    }
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        schedule: emptySchedule
    })
    const [editingId, setEditingId] = useState(null) // Track which course is being edited

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosPrivate.get('/courses')
                setCourses(res.data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (editingId) {
            // We're editing, call handleEdit instead
            await handleEditSubmit()
        } else {
            // We're adding new
            try {
                const res = await axiosPrivate.post('/courses', formData)

                //instantly update UI
                setCourses(prev => [...prev, res.data])

                //reset form state
                setFormData({
                    code: "",
                    name: "",
                    schedule: emptySchedule
                })
            } catch (error) {
                console.error(error)
            }
        }
    }

    const handleEdit = (id) => {
        // Pre-fill the form with course data
        const course = courses.find(c => c._id === id)
        if (course) {
            setFormData({
                code: course.code,
                name: course.name,
                schedule: course.schedule
            })
            setEditingId(id)
        }
    }

    const handleEditSubmit = async () => {
        try {
            const res = await axiosPrivate.put(`/courses/${editingId}`, formData)

            //instantaneously update UI
            setCourses(prev =>
                prev.map(course =>
                    course._id === editingId ? res.data : course
                )
            )

            //reset form state
            setFormData({
                code: "",
                name: "",
                schedule: emptySchedule
            })
            setEditingId(null)
        } catch (error) {
            console.error(error)
        }
    }

    const cancelEdit = () => {
        setFormData({
            code: "",
            name: "",
            schedule: emptySchedule
        })
        setEditingId(null)
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove this course from all attendance records.")) {
            return
        }

        try {
            await axiosPrivate.delete(`/courses/${id}`)
            setCourses(prev => prev.filter((course) => course._id !== id))
        } catch (error) {
            console.error(error)
        }
    }

    // form helpers
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name] : e.target.value})
    }

    const handleScheduleChange = (e, day) => {
        setFormData(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [day]: Number(e.target.value)
            }
        }))
    }

    if (loading) return (
        <p>Loading...</p>
    )

    return (
        <>
            <Navbar />
            <div className="mycourses-container">
                <h1>My Courses</h1>
                
                {courses.length === 0 && <p>No Courses Found</p>}

                <div className="courses-grid">
                    {courses.map(course => (
                        <CourseCard 
                        key={course._id}
                        course={course}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        />
                    ))}
                </div>

                
                <form onSubmit={handleSubmit} className="course-form">
                    <h2>{editingId ? "Edit Course" : "Add Course"}</h2>
                    
                    <input 
                        type="text" 
                        name="code"
                        placeholder="Course Code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                    />

                    <input 
                        type="text" 
                        name="name"
                        placeholder="Course Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                
                    <div className='schedule-grid'>
                        {Object.keys(emptySchedule).map((day) => (
                            <div key={day} className="schedule-item">
                                <label>{day}</label>
                                <input 
                                    type="number"
                                    min="0"
                                    value={formData.schedule[day]}
                                    onChange={(e) => handleScheduleChange(e, day)}
                                />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit">
                            {editingId ? "Update Course" : "Add Course"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={cancelEdit}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
                
            </div>
        </>
    )
}