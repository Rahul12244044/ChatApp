import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const firstLetter = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  // Build image URL if profileImage exists
  const imageUrl = user?.profileImage
    ? `${import.meta.env.VITE_API_URL}${user.profileImage.replace(/^\//, "")}`
    : null;

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>
        AR<span className={styles.connect}>connect</span>
      </div>
      <div className={styles.right}>
        <span className={styles.userName}>{user?.username}</span>

        {/* Avatar - show image if exists, else fallback letter */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="User Avatar"
            className={styles.avatarImg}
            onClick={() => navigate("/profile")}
          />
        ) : (
          <div
            className={styles.avatar}
            onClick={() => navigate("/profile")}
            title="Go to Profile"
          >
            {firstLetter}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
