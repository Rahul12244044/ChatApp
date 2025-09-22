import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/home.module.css";
import UserCard from "../components/userCard.jsx";
import ChatBox from "../components/chatBox.jsx";
import { socket } from "../socket.js";
import Navbar from "../components/navbar.jsx";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [viewMode, setViewMode] = useState("all"); // "all" | "my"

  const token = sessionStorage.getItem("token");
  const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("online-users", (ids) => setOnlineUserIds(ids));
    return () => socket.off("online-users");
  }, []);

  useEffect(() => {
    if (!loggedInUser) return;

    if (!socket.connected) socket.connect();
    socket.emit("add-user", loggedInUser._id);

    const handleProfileUpdate = ({ userId, avatar }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, profileImage: avatar } : u))
      );
    };

    socket.on("profile-updated", handleProfileUpdate);
    return () => socket.off("profile-updated", handleProfileUpdate);
  }, [loggedInUser]);

  useEffect(() => {
    if (!token || !loggedInUser) return;

    const fetchData = async () => {
      try {
        const [usersRes, friendsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}api/users/friends`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const friendsList = friendsRes.data.map((f) => f._id);
        setFriends(friendsRes.data);

        // Mark users as friend or not
        const updatedUsers = usersRes.data
          .filter((u) => u._id !== loggedInUser._id)
          .map((u) => ({
            ...u,
            isFriend: friendsList.includes(u._id),
          }));

        setUsers(updatedUsers);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [token,loggedInUser._id]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    socket.disconnect();
    navigate("/login");
    window.location.reload();
  };

  // Add friend
 const addFriend = async (userId) => {
  // ✅ update UI first
  setUsers((prev) =>
    prev.map((u) => (u._id === userId ? { ...u, isFriend: true } : u))
  );
  const newFriend = users.find((u) => u._id === userId);
  setFriends((prev) => [...prev, newFriend]);

  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}api/users/friends/add/${userId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("Error adding friend:", err);
    // ❌ rollback if failed
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isFriend: false } : u))
    );
    setFriends((prev) => prev.filter((f) => f._id !== userId));
  }
};
  // Remove friend
const removeFriend = async (userId) => {
  // ✅ update UI first
  setUsers((prev) =>
    prev.map((u) => (u._id === userId ? { ...u, isFriend: false } : u))
  );
  setFriends((prev) => prev.filter((f) => f._id !== userId));

  try {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}api/users/friends/remove/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("Error removing friend:", err);
    // ❌ rollback if failed
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isFriend: true } : u))
    );
    const removedUser = users.find((u) => u._id === userId);
    if (removedUser) {
      setFriends((prev) => [...prev, removedUser]);
    }
  }
};
  // Decide which list to render
  const displayedUsers = viewMode === "all" ? users : friends;

  return (
    <>
      <Navbar />
      <div className={styles.home}>
        <aside className={styles.sidebar}>
          <div className={styles.userHeader}>
            <h2>👥 Users</h2>
            <div className={styles.toggleBtns}>
              <button
                className={viewMode === "all" ? styles.activeBtn : ""}
                onClick={() => setViewMode("all")}
              >
                All
              </button>
              <button
                className={viewMode === "my" ? styles.activeBtn : ""}
                onClick={() => setViewMode("my")}
              >
                My
              </button>
            </div>
          </div>

          {displayedUsers.length === 0 ? (
  <p>
    {viewMode === "all"
      ? "No users available"
      : "No friends added yet"}
  </p>
) : (
  displayedUsers.map((user) => (
    <div key={user._id} className={styles.userRow}>
      <UserCard
        user={user}
        isOnline={onlineUserIds.includes(user._id)}
        onClick={() => {
          if (user._id !== loggedInUser._id) {
            setActiveChatUser(user);
          }
        }}
      />

      {/* ✅ Differentiate buttons by view mode */}
      {viewMode === "my" ? (
        <button
          className={`${styles.friendBtn} ${styles.remove}`}
          onClick={() => removeFriend(user._id)}
        >
          ❌
        </button>
      ) : user.isFriend ? (
        <button
          className={`${styles.friendBtn} ${styles.remove}`}
          onClick={() => removeFriend(user._id)}
        >
          ❌
        </button>
      ) : (
        <button
          className={styles.friendBtn}
          onClick={() => addFriend(user._id)}
        >
          ➕
        </button>
      )}
    </div>
  ))
)}


          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </aside>

        <main className={styles.chatArea}>
          {activeChatUser ? (
            <ChatBox user={activeChatUser} />
          ) : (
            <p className={styles.placeholder}>
              Select a user to start chatting
            </p>
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
