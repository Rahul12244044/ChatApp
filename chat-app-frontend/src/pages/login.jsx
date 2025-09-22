import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import styles from "../styles/login.module.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    console.log("handleSubmit: ");
    console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
  e.preventDefault();
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}api/user/login`, form, { withCredentials: true });
    console.log(res);
    sessionStorage.setItem("token", res.data.token);
    sessionStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    console.log("res: ");
    console.log(res);
    window.location.href = "/";
  } catch (err) {
    console.log(err);
  }finally{
    setLoading(false);
  }
};



  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className={styles.link}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        {/* Centered loader */}
        {loading && (
          <div className={styles.loaderOverlay}>
            <div className={styles.loader}></div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;

