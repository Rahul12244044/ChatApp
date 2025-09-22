import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/comeAgain.module.css";

const LogoutPage = () => {
  return (
    <div className={styles.logoutContainer}>
      <h1>👋 Come Again!</h1>
      <p>Thanks for using <span className={styles.loginLink}>TalkRandoms</span></p>
      <Link to="/login" className={styles.loginLink}>
        Go to Login
      </Link>
    </div>
  );
};

export default LogoutPage;
