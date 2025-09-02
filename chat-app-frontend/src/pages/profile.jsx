import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/profile.module.css";
import { useNavigate } from "react-router-dom";
import { MdAttachFile } from "react-icons/md";


const Profile = () => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  
  const userData = sessionStorage.getItem("user");
  const loggedInUser = userData ? JSON.parse(userData) : null;
  const token = sessionStorage.getItem("token");

  if (!loggedInUser) {
    return (
      <div className={styles.profile}>
        <h2>Please log in to view your profile.</h2>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.avatar.files[0];
    if (!file) return alert("Please select an image.");

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", loggedInUser._id);

    try {
      setUploading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}api/upload/profile-pic`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("profile: ");
      console.log(res);

      alert("Profile picture updated!");
      const updatedUser = res.data.user;

     
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/");
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = loggedInUser?.profileImage
  ? `${import.meta.env.VITE_API_URL}${loggedInUser.profileImage}`
  : "/default-avatar.png";
    console.log("profile Url: ");
    console.log(avatarUrl);

  return (
    
    <div className={styles.profile}>
      <h2>Your Profile</h2>
      <div className={styles.profileCard}>
        <img
          src={preview || avatarUrl}
          alt="Profile"
          className={styles.avatar}
        />
        <p><strong>Username:</strong> {loggedInUser?.username}</p>
        <p><strong>Email:</strong> {loggedInUser?.email}</p>

        <form onSubmit={handleUpload} className={styles.uploadSection}>
          <label className={styles.attachmentIcon}>
              <MdAttachFile size={22} />
               <input className={styles.hiddenInput} type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
            </label>
          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Update Profile Picture"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
