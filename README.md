# Attendance Tracker Web App

A **multi-user, schedule-aware attendance tracking web application** designed for semester-long academic planning.

The app allows students to define their courses and weekly schedules, mark holidays and instructional days on a calendar, record daily attendance, and receive real-time analytics such as attendance percentage, alerts, and how many classes they can safely skip while meeting required thresholds.

---

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected routes (only logged-in users can access data)

### Course & Schedule Management
- Add courses via UI
- Select days of the week for each course
- Define number of classes per day
- Set minimum attendance threshold per course

### Calendar-Aware Attendance
- Calendar view with instructional/holiday toggle
- Defaults:
  - Monday–Friday → Instructional
  - Saturday–Sunday → Non-instructional
- Holidays automatically exclude attendance calculations

### Attendance Tracking
- Daily attendance entry per course
- Scheduled classes auto-filled from timetable
- Validation to prevent invalid entries

###  Analytics & Alerts
- Current attendance percentage
- Maximum possible attendance (if all future classes are attended)
- Number of classes that can be skipped safely
- Alerts when attendance falls below threshold

###  Multi-User Support
- Each user has isolated data
- Secure access to personal schedules and attendance

### Future Integrations
- Modile alerts on nearing attendance shortages, to prevent accessing the website everyday

---

##  Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- CSS Modules (no Tailwind / UI frameworks)

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication

