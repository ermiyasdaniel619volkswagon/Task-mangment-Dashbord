import { useState } from "react";
import Auth from "./components/Auth.jsx";
import Dashboard from "./components/Dashboard.jsx";
import API from "./services/api.js";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("user"),
  );

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout"); // Clears cookie on server side
    } catch (err) {
      console.error("Error executing network cookie cleanup route:", err);
    } finally {
      localStorage.removeItem("user");
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
