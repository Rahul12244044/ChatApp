import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from "react";
import Register from './pages/register.jsx';
import Login from './pages/login.jsx';
import Home from './pages/home.jsx';
import Profile from "./pages/profile.jsx";

const App = () => {
  const [token, setToken] = useState(() => {
    let sessionToken = sessionStorage.getItem("token");

    if (!sessionToken && localStorage.getItem("token")) {
      sessionToken = localStorage.getItem("token");
      sessionStorage.setItem("token", sessionToken);
      sessionStorage.setItem("user", localStorage.getItem("user"));
    }
    return sessionToken;
  });

  return (
    <Routes>
      <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
      <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
      <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
