import api from '../services/api'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styles from '../styles/auth.module.css'
export default function Register(){
    const navigate = useNavigate()
    
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await api.post('/register', {
                name,
                email,
                password
            })
            console.log("Registration successful")
            navigate('/login')

        } catch (err) {
            if (!err.response) {
                setError("No server response")
            } else if (err.response.status === 409) {
                setError("Email already exists")
            } else {
                setError("Registration failed")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <form className={styles.card} onSubmit={handleSubmit}>
                <h1>Register</h1>
                <p className={styles.tagline}>
                Start tracking your academic attendance in one place.
                </p>
                {error && <p className={styles.error}>{error}</p>}

            <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />

            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />

            <button disabled={loading}>
            {loading ? "Registering..." : "Register"}
            </button>
            <p className={styles.switch}>
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </p>

            </form>
            
        </div>
    )
}