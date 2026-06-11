import axios from "axios";

const API = axios.create({
  baseURL: "https://task-mangment-dashbord-rbx1.vercel.app/api",
  // baseURL: "http://localhost:5000/api",// for local development
  withCredentials: true, // Instructs browser to attach cookies to every request automatically
});

export default API;
