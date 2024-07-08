import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

export const GitlabInterceptor: AxiosInstance = axios.create({
  baseURL: window.CONFIG.BACKEND_URL,
  withCredentials: true,
});

GitlabInterceptor.interceptors.request.use(
  (config) => {
    const csrfToken = Cookies.get("csrf_access_token");

    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    }

    return config || [];
  },
  (error) => {
    return Promise.reject(error);
  }
);