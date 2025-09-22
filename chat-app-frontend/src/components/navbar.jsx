import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>ARconnect</div>
      <div className={styles.right}>
        <span>{user?.username}</span>
        <button onClick={() => navigate("/profile")}>Profile</button>
      </div>
    </div>
  );
};

export default Navbar;
