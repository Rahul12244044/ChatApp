import styles from "../styles/userCard.module.css";

const UserCard = ({ user, isOnline, onClick }) => {
  return (
    <div className={styles.userCard} onClick={onClick}>
      <div className={styles.avatarWrapper}>
        <img
          src={
            user.profileImage
              ? `http://localhost:5000${user.profileImage}`
              : "/default-avatar.png"
          }
          alt="avatar"
          className={styles.avatar}
        />
        <span
          className={`${styles.statusDot} ${
            isOnline ? styles.online : styles.offline
          }`}
        ></span>
      </div>
      <div className={styles.userInfo}>
        <span className={styles.username}>{user.username}</span>
        
      </div>
    </div>
  );
};

export default UserCard;
