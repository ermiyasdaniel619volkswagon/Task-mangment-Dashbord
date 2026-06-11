import axios from "axios";

const API = axios.create({
  baseURL: "https://task-mangment-dashbord-rbx1.vercel.app/api",
  withCredentials: true, // Instructs browser to attach cookies to every request automatically
});

export default API;
