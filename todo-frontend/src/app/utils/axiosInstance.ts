import axios from "axios";
import { getToken, getRefreshToken, setTokens, clearTokens } from "./auth";

/**
 * An Axios instance pre-configured with the base API URL for HTTP requests.
 *
 * @remarks
 * The `baseURL` is set to `http://localhost:5000/api` by default.
 * If accessing from a mobile device, update the URL to your local network IP (e.g., `http://192.168.x.x:5000/api`).
 *
 * @see {@link https://axios-http.com/docs/instance}
 */
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // // change the url to http://192.168.x.x:5000/api if you are on a mobile device.
});

// Attach access token on every request
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired token & auto-refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      try {
        const res = await axios.post("http://localhost:5000/api/auth/refresh-token", {
          token: refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        const remember = !!localStorage.getItem("refreshToken"); // infer storage

        setTokens(newAccessToken, refreshToken!, remember);

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

