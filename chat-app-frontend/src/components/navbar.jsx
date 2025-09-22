import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const firstLetter = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>
        AR<span className={styles.connect}>connect</span>
      </div>
      <div className={styles.right}>
        <span className={styles.userName}>{user?.username}</span>
        {/* Avatar Circle */}
        <div 
          className={styles.avatar} 
          onClick={() => navigate("/profile")}
          title="Go to Profile"
        >
          {firstLetter}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
