import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/api/", // Local Server
  baseURL: "https://aptly-backend.onrender.com/api/", // Production Server
});

export default api;
