import axios from "axios";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const axiosPrivate = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

export default function useAxiosPrivate() {
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
    };
  }, [token]);

  return axiosPrivate;
}
