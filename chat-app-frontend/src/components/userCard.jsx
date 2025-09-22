import styles from "../styles/userCard.module.css";

const UserCard = ({ user, isOnline, onClick }) => {
  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";

  return (
    <div className={styles.userCard} onClick={onClick}>
      <div className={styles.avatarWrapper}>
        {user?.profileImage ? (
          <img
            src={`${import.meta.env.VITE_API_URL}/${user.profileImage.replace(/^\//, "")}`}
            alt="avatar"
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarFallback}>{firstLetter}</div>
        )}

        <span
          className={`${styles.statusDot} ${
            isOnline ? styles.online : styles.offline
          }`}
        ></span>
      </div>

      <div className={styles.userInfo}>
        <span className={styles.username}>{user.username}</span>
      </div>
      <hr />
    </div>
  );
};

export default UserCard;
