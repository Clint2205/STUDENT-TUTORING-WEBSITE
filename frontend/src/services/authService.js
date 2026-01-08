import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const login = (data) =>
  axios.post(`${API}/login`, data);

export const register = (data) =>
  axios.post(`${API}/register`, data);

// interceptor ONLY
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
