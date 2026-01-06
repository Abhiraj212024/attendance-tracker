import axios from "axios"

const axiosPrivate = axios.create({
    baseURL: "http://localhost:5001",
    withCredentials: true
});

export default axiosPrivate