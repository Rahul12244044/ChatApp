import { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from "../styles/chatBox.module.css";
import { socket } from "../socket.js";
import EmojiPicker from 'emoji-picker-react';
import { MdAttachFile } from "react-icons/md";
const ChatBox = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [typingStatus, setTypingStatus] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


  const token = sessionStorage.getItem("token");
  const loggedInUser = JSON.parse(sessionStorage.getItem("user"));

  const isSelfChat = user._id === loggedInUser._id;

  const markMessagesAsSeen = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}api/messages/mark-seen/${user._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit("mark-as-seen", { from: loggedInUser._id, to: user._id });
    } catch (err) {
      console.error("Error marking messages as seen", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    console.log("messageId: "+messageId);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      socket.emit("delete-msg", { messageId });
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  useEffect(() => {
    socket.on("msg-deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off("msg-deleted");
    };
  }, []);

  useEffect(() => {
    if (!isSelfChat) {
      markMessagesAsSeen();
    }
  }, [user._id]);

  useEffect(() => {
    const handleSeen = ({ from, to }) => {
      if (from === user._id && to === loggedInUser._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            (msg.sender || msg.from) === loggedInUser._id ? { ...msg, seen: true } : msg
          )
        );
      }
    };
    socket.on("mark-as-seen", handleSeen);
    return () => socket.off("mark-as-seen", handleSeen);
  }, [user._id]);

  useEffect(() => {
    if (!isSelfChat) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}api/messages/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setMessages(res.data);
           const loadingMap = {};
    res.data.forEach((msg) => {
      if (msg.file && /\.(jpe?g|png|gif|webp)$/i.test(msg.file)) {
        loadingMap[msg._id] = true;
      }
    });
    setImageLoading(loadingMap);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };

      fetchMessages();

     const handleReceive = (msg) => {
  const isCurrentChat =
    (msg.from === loggedInUser._id && msg.to === user._id) ||
    (msg.to === loggedInUser._id && msg.from === user._id);

  if (isCurrentChat) {
    if (msg.from === loggedInUser._id) return;
    setMessages((prev) => [...prev, msg]);

    // Only mark as seen if this user is the receiver
    if (msg.to === loggedInUser._id && msg.from === user._id) {
      markMessagesAsSeen();
    }
  }
};


      const handleTyping = ({ from }) => {
        if (from === user._id) setTypingStatus(true);
      };

      const handleStopTyping = ({ from }) => {
        if (from === user._id) setTypingStatus(false);
      };

      socket.on("msg-receive", handleReceive);
      socket.on("typing", handleTyping);
      socket.on("stop-typing", handleStopTyping);
      return () => {
        socket.off("msg-receive", handleReceive);
        socket.off("typing", handleTyping);
        socket.off("stop-typing", handleStopTyping);
      };
    }
  }, [user._id, isSelfChat, loggedInUser._id, token]);

  // when user sends
const handleSendMessage = () => {
  if (!newMsg.trim()) return;

  const pendingMessage = {
    text: newMsg,
    senderId: user._id,
    createdAt: new Date().toISOString(),
    isPending: true, // mark as waiting for server confirmation
  };

  // add to UI immediately
  setMessages((prev) => [...prev, pendingMessage]);

  // send to server
  socket.emit("send_message", pendingMessage);

  setNewMsg("");
};

// listen for server messages
useEffect(() => {
  socket.on("receive_message", (msg) => {
    setMessages((prev) => {
      // optional: prevent duplicate by checking pendingMessage
      const exists = prev.some(
        (m) => m.text === msg.text && m.senderId === msg.senderId
      );
      if (exists) return prev;
      return [...prev, msg];
    });
  });

  return () => socket.off("receive_message");
}, []);


  const handleInputChange = (e) => {
    setNewMsg(e.target.value);
    console.log("user_id");
    console.log(user._id);
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { to: user._id, from: loggedInUser._id });
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop-typing", { to: user._id, from: loggedInUser._id });
    }, 1000);

    setTypingTimeout(timeout);
  };

  return (
    <div className={styles.chatBox}>
      {isSelfChat ? (
        <div className={styles.warning}>You cannot chat with yourself.</div>
      ) : (
        <>
          <h3>Chat with {user.username}</h3>
          
          <div className={styles.messages}>
            {messages.map((msg, i) => {
              const isSender = (msg.sender || msg.from) === loggedInUser._id;
              return (
                <div
                  key={i}
                  className={`${styles.messageBubble} ${
                    isSender ? styles.sent : styles.received
                  }`}
                >
                  {!isSender && <div className={styles.senderName}>{user.username}</div>}
                  <div className={styles.messageContent}>
                    {msg.content && <span>{msg.content}</span>}
                    {msg.file && (() => {
                      const extension = msg.file.split('.').pop().toLowerCase();
                      const fileName = msg.file.split('/').pop();

                      if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
                        return (
                          <div style={{ position: "relative" }}>
                            {imageLoading[msg._id] && (
                      <div className={styles.spinner}></div>
)}
                      <img
                      src={msg.file}
                      alt="sent"
                      loading="lazy"
                      onLoad={() =>
                      setImageLoading((prev) => ({ ...prev, [msg._id]: false }))
                      }
                      style={{maxWidth: "150px", marginTop: "10px", borderRadius: "8px", cursor: "pointer", opacity: imageLoading[msg._id] ? 0 : 1, // Hide until loaded
}}                    onClick={() => setPreviewImage(msg.file)}/>
                          </div>
                        );
                      } else if (["mp4", "webm", "ogg"].includes(extension)) {
                        return (
                          <video
                            controls
                            style={{ maxWidth: "150px", marginTop: "10px", borderRadius: "8px", cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(msg.file);
                            }}
                          >
                            <source src={msg.file} type={`video/${extension}`} />
                            Your browser does not support the video tag.
                          </video>
                        );
                      } else {
                        return (
                          <div
                            className={styles.pdfCard}
                            onClick={() => setPreviewImage(msg.file)}
                          >
                            <div className={styles.pdfIcon}>📄</div>
                            <div className={styles.pdfInfo}>
                              <div className={styles.pdfName}>{fileName}</div>
                              <div className={styles.pdfHint}>Click to open & download</div>
                            </div>
                          </div>
                        );
                      }
                    })()}

                    <span className={styles.timestamp}>
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {isSender && (
                      <span
                        className={`${styles.tickContainer} ${
                          msg.seen ? styles.seen : styles.delivered
                        }`}
                      >
                        <span className={styles.tick}>✔</span>
                        {msg.seen && (
                          <span className={`${styles.tick} ${styles.tickOverlay}`}>✔</span>
                        )}
                      </span>
                    )}
                    <span
                      className={styles.deleteIcon}
                      title="Delete message"
                      onClick={() => handleDeleteMessage(msg._id)}
                    >
                      🗑️
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef}></div>
          </div>

          <div className={styles.inputArea}>
            <input
              value={newMsg}
              onChange={handleInputChange}
              placeholder={typingStatus ? `${user.username} is typing...` : "Type a message..."}
            />
          <label className={styles.attachmentIcon}>
    <MdAttachFile size={22} />
    <input type="file" onChange={handleFileChange} className={styles.hiddenInput} />
  </label>
            <button onClick={handleSend}>Send</button>
          </div>

          {previewImage && (
            <div className={styles.modalOverlay} onClick={() => setPreviewImage(null)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {previewImage.match(/\.(mp4|webm|ogg)$/) ? (
                  <video controls className={styles.modalVideo}>
                    <source
                      src={previewImage}
                      type={`video/${previewImage.split(".").pop()}`}
                    />
                    Your browser does not support video preview.
                  </video>
                ) : previewImage.match(/\.pdf$/) ? (
                  <>
                    <iframe
                      src={previewImage}
                      className={styles.modalIframe}
                      title="Document Preview"
                    ></iframe>
                    <a
                      href={previewImage}
                      download
                      style={{ display: "none" }}
                      ref={(el) => {
                        if (el) el.click();
                      }}
                    >
                      download
                    </a>
                  </>
                ) : (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className={styles.modalImage}
                  />
                )}
                <button
                  onClick={() => setPreviewImage(null)}
                  className={styles.closeButton}
                >
                  ✖
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatBox;