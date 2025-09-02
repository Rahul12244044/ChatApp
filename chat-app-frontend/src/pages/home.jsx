import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/home.module.css";
import UserCard from "../components/userCard.jsx";
import ChatBox from "../components/chatBox.jsx"
import { socket } from "../socket.js";
import Navbar from "../components/navbar.jsx";
import {useNavigate} from "react-router-dom";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const token = sessionStorage.getItem("token");
  const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  const navigate=useNavigate();
  useEffect(() => {
  socket.on("online-users", (ids) => {
    setOnlineUserIds(ids);
  });

  return () => socket.off("online-users");
}, []);
  useEffect(() => {
    if (!loggedInUser) return;

    if (!socket.connected) {
      socket.connect();
      console.log("socket connected");
    }

    socket.emit("add-user", loggedInUser._id);
    console.log("add-user emitted for:", loggedInUser._id);

    const handleProfileUpdate = ({ userId, avatar }) => {
      console.log("handleProfileUpdate: ");
      console.log(avatar);
      console.log("profile-updated received:", userId, avatar);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, profileImage: avatar } : u
        )
      );
    };

    socket.on("profile-updated", handleProfileUpdate);

    return () => {
      socket.off("profile-updated", handleProfileUpdate);
    };
  }, []); 


  useEffect(() => {
    if (activeChatUser && activeChatUser._id === loggedInUser._id) {
      setActiveChatUser(null);
    }
  }, [activeChatUser, loggedInUser]);


  useEffect(() => {
    if (!token || !loggedInUser) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filteredUsers = res.data.filter(
          (u) => u._id !== loggedInUser?._id
        );
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [token, loggedInUser]);

  const handleLogout = () => {
    console.log("handleLogout: ");
    sessionStorage.clear();
    localStorage.clear();

    socket.disconnect();
    navigate("/login");
    // window.location.href = "login";
  };

  return (
    <>
      <Navbar />
      <div className={styles.home}>
        <aside className={styles.sidebar}>
          <h2>👥 Users</h2>
          {users.length === 0 ? (
            <p>No users available</p>
          ) : (
            users.map((user) => (
              <UserCard
              key={user._id}
              user={user}
              isOnline={onlineUserIds.includes(user._id)}
              onClick={() => {
              if (user._id !== loggedInUser._id) {
              setActiveChatUser(user);
              }
              }}
              />
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
            <p className={styles.placeholder}>Select a user to start chatting</p>
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
