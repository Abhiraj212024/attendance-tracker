import axios from "axios";

const axiosPrivate = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

export default axiosPrivate;
