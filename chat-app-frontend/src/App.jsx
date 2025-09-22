import { Routes, Route, Navigate } from 'react-router-dom';
import { useState,useEffect } from "react";
import Register from './pages/register.jsx';
import Login from './pages/login.jsx';
import Home from './pages/home.jsx';
import Profile from "./pages/profile.jsx";

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("token");
    setToken(sessionToken);
  }, []); // runs when App mounts

  useEffect(() => {
    const syncToken = () => {
      setToken(sessionStorage.getItem("token"));
    };
    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);
  console.log("token: ");
  return (
    <Routes>
      <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
      <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
      <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/logout" element={<LogoutPage/>}/>
    </Routes>
  );
};

export default App;
