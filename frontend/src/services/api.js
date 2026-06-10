import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Instructs browser to attach cookies to every request automatically
});

export default API;
