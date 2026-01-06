import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import axiosPrivate from "../services/axiosPrivate";

export default function useAxiosPrivate() {
  const { accessToken, setAccessToken } = useContext(AuthContext);

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"] && accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;

          const res = await axiosPrivate.post("/refresh");
          setAccessToken(res.data.accessToken);

          prevRequest.headers["Authorization"] =
            `Bearer ${res.data.accessToken}`;

          return axiosPrivate(prevRequest);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, setAccessToken]);

  return axiosPrivate;
}
