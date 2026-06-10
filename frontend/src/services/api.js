// import axios from "axios";

// // Point this to your backend port configuration
// const API = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// // Request Interceptor to dynamically append JWT tokens from localStorage
// API.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// export default API;
import axios from "axios";

const API = axios.create({
  baseURL: "https://task-mangment-dashbord.vercel.app/api",
  withCredentials: true, // Instructs browser to attach cookies to every request automatically
});

export default API;
