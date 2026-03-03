import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL || "https://phase-earned-characterized-travelling.trycloudflare.com/api", // use import.meta.env in Vite
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default api;
