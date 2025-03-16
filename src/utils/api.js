import axios from "axios";

const api = axios.create({
  baseURL: "https://aptly-backend.onrender.com", // Replace with your actual Render URL
});

export default api;
