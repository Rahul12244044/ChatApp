// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import styles from "../styles/chatBox.module.css";
// import { socket } from "../socket.js";

// const ChatBox = ({ user }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [typingTimeout, setTypingTimeout] = useState(null);
//   const [typingStatus, setTypingStatus] = useState(false); // <-- NEW

//   const messagesEndRef = useRef(null);
//   const token = sessionStorage.getItem("token");
//   const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
//   const isSelfChat = user._id === loggedInUser._id;

//   // 🔄 Scroll to bottom when messages update
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, typingStatus]);

//   useEffect(() => {
//     if (!isSelfChat) {
//       const fetchMessages = async () => {
//         try {
//           const res = await axios.get(`http://localhost:5000/api/messages/${user._id}`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           setMessages(res.data);
//         } catch (err) {
//           console.error("❌ Error fetching messages:", err);
//         }
//       };

//       fetchMessages();

//       const handleReceive = (msg) => {
//         if (
//           (msg.from === loggedInUser._id && msg.to === user._id) ||
//           (msg.to === loggedInUser._id && msg.from === user._id)
//         ) {
//           setMessages((prev) => [...prev, { sender: msg.from, content: msg.content }]);
//         }
//       };

//       const handleTyping = ({ from }) => {
//         if (from === user._id) {
//           setTypingStatus(true);
//         }
//       };

//       const handleStopTyping = ({ from }) => {
//         if (from === user._id) {
//           setTypingStatus(false);
//         }
//       };

//       socket.on("msg-receive", handleReceive);
//       socket.on("typing", handleTyping);
//       socket.on("stop-typing", handleStopTyping);

//       return () => {
//         socket.off("msg-receive", handleReceive);
//         socket.off("typing", handleTyping);
//         socket.off("stop-typing", handleStopTyping);
//       };
//     }
//   }, [user, loggedInUser, isSelfChat]);

//   const handleSend = async () => {
//     if (!newMsg.trim() || isSelfChat) {
//       return;
//     }

//     const messageData = {
//       to: user._id,
//       from: loggedInUser._id,
//       content: newMsg,
//       timestamp: Date.now(),
//     };

//     socket.emit("send-msg", messageData);
//     setMessages((prev) => [...prev, { sender: loggedInUser._id, content: newMsg }]);
//     setNewMsg("");

//     socket.emit("stop-typing", { to: user._id, from: loggedInUser._id });

//     try {
//       await axios.post(
//         "http://localhost:5000/api/messages",
//         { receiver: user._id, content: newMsg },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     } catch (err) {
//       console.error("❌ Error sending message:", err);
//     }
//   };

//   // ✅ Handle typing with debounce
//   const handleInputChange = (e) => {
//     setNewMsg(e.target.value);

//     if (!isTyping) {
//       setIsTyping(true);
//       socket.emit("typing", { to: user._id, from: loggedInUser._id });
//     }

//     if (typingTimeout) clearTimeout(typingTimeout);

//     const timeout = setTimeout(() => {
//       setIsTyping(false);
//       socket.emit("stop-typing", { to: user._id, from: loggedInUser._id });
//     }, 1500);

//     setTypingTimeout(timeout);
//   };

//   return (
//     <div className={styles.chatBox}>
//       {isSelfChat ? (
//         <div className={styles.warning}>⚠️ You cannot chat with yourself.</div>
//       ) : (
//         <>
//           <h3>Chat with {user.username}</h3>
//           <div className={styles.messages}>
//             {messages.map((msg, i) => {
//               const isSender = msg.sender === loggedInUser._id;
//               return (
//                 <div
//                   key={i}
//                   className={`${styles.messageBubble} ${
//                     isSender ? styles.sent : styles.received
//                   }`}
//                 >
//                   {!isSender && <div className={styles.senderName}>{user.username}</div>}
//                   <div className={styles.messageContent}>
//                     <span>{msg.content}</span>
//                     <span className={styles.timestamp}>
//                       {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//             {typingStatus && (
//               <div className={styles.typingIndicator}>
//                 {user.username} is typing...
//               </div>
//             )}
//             <div ref={messagesEndRef}></div>
//           </div>

//           <div className={styles.inputArea}>
//             <input
//               value={newMsg}
//               onChange={handleInputChange}
//               placeholder="Type a message..."
//               className={styles.chatInput}
//             />
//             <button onClick={handleSend}>Send</button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ChatBox;










// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import styles from "../styles/chatBox.module.css";
// import { socket } from "../socket.js";

// const ChatBox = ({ user }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const messagesEndRef = useRef(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const [typingTimeout, setTypingTimeout] = useState(null);
//   const [typingStatus, setTypingStatus] = useState(false); 

//   const token = sessionStorage.getItem("token");
//   const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
//   const isSelfChat = user._id === loggedInUser._id;
//   const markMessagesAsSeen = async () => {
//     try {
//       await axios.patch(
//         `http://localhost:5000/api/messages/mark-seen/${user._id}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       socket.emit("mark-as-seen", { from: user._id, to: loggedInUser._id });
//     } catch (err) {
//       console.error("❌ Error marking messages as seen", err);
//     }
//   };
//   useEffect(() => {
//   if (!isSelfChat) {
//     markMessagesAsSeen(); // ✅ Call it when chat is opened
//   }
// }, [user._id]);

//   useEffect(() => {
//     if (!isSelfChat) {
//       const fetchMessages = async () => {
//         try {
//           const res = await axios.get(`http://localhost:5000/api/messages/${user._id}`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           setMessages(res.data);
//         } catch (err) {
//           console.error("❌ Error fetching messages:", err);
//         }
//       };

//       fetchMessages();

//       const handleReceive = (msg) => {
//         if (
//           (msg.from === loggedInUser._id && msg.to === user._id) ||
//           (msg.to === loggedInUser._id && msg.from === user._id)
//         ) {
//           setMessages((prev) => [...prev, { sender: msg.from, content: msg.content }]);
//         }
//       };
//       const handleTyping = ({ from }) => {
//         console.log("handleTyping: ");
//         console.log(typingStatus);
//       if (from === user._id) setTypingStatus(true);
//     };

//     const handleStopTyping = ({ from }) => {
//       if (from === user._id) setTypingStatus(false);
//     };


//       socket.on("msg-receive", handleReceive);
//       socket.on("typing", handleTyping);
//       socket.on("stop-typing", handleStopTyping);
//        return () => {
//         socket.off("msg-receive", handleReceive);
//         socket.off("typing", handleTyping);
//         socket.off("stop-typing", handleStopTyping);
//       };
//     }
//   }, [user._id, isSelfChat, loggedInUser._id, token]);

  

//   const handleSend = async () => {
//     if (!newMsg.trim() || isSelfChat) {
//       console.warn("⚠️ Cannot send message to self or empty message.");
//       return;
//     }

//     const messageData = {
//       to: user._id,
//       from: loggedInUser._id,
//       content: newMsg,
//       timestamp: Date.now(),
//     };
//      socket.emit("send-msg", messageData);
//       setMessages((prev) => [...prev, { sender: loggedInUser._id, content: newMsg }]);
//        setNewMsg("");
//       socket.emit("stop-typing", { to: user._id, from: loggedInUser._id });
//     console.time("SendMessage");
//     try {
//       await axios.post(
//         "http://localhost:5000/api/messages",
//         { receiver: user._id, content: newMsg },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     } catch (err) {
//       console.error("❌ Error sending message:", err);
//     }
//     console.timeEnd("SendMessage"); 
//   };
//   const handleInputChange = (e) => {
//     setNewMsg(e.target.value);
//     console.log("handleInputChange");
//     console.log("isTyping");
//     console.log(isTyping);
//     if (!isTyping) {
//       setIsTyping(true);
//       socket.emit("typing", { to: user._id, from: loggedInUser._id });
//     }

//     if (typingTimeout) clearTimeout(typingTimeout);

//     const timeout = setTimeout(() => {
//       setIsTyping(false);
//       socket.emit("stop-typing", { to: user._id, from: loggedInUser._id });
//     }, 1000);

//     setTypingTimeout(timeout);
//   };

//   return (
//     <div className={styles.chatBox}>
//       {isSelfChat ? (
//         <div className={styles.warning}>⚠️ You cannot chat with yourself.</div>
//       ) : (
//         <>
//           <h3>Chat with {user.username}</h3>
//           <div className={styles.messages}>
//   {messages.map((msg, i) => {
//     const isSender = msg.sender === loggedInUser._id;
//     return (
//       <div
//         key={i}
//         className={`${styles.messageBubble} ${
//           isSender ? styles.sent : styles.received
//         }`}
//       >
//         {!isSender && <div className={styles.senderName}>{user.username}</div>}
//         <div className={styles.messageContent}>
//           <span>{msg.content}</span>
//           <span className={styles.timestamp}>
//             {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             })}
//           </span>
//           {isSender && msg.seen && (
//           <span className={styles.seenIndicator}>✓ Seen</span>
//         )}
//         </div>
//       </div>
//     );
//   })}
   
//   <div ref={messagesEndRef}></div>
// </div>

//           <div className={styles.inputArea}>
//             <input
//               value={newMsg}
//              onChange={handleInputChange}
//              placeholder={typingStatus ? `${user.username} is typing...` : "Type a message..."}
//             />
//             <button onClick={handleSend}>Send</button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ChatBox;
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from "../styles/chatBox.module.css";
import { socket } from "../socket.js";

const ChatBox = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [typingStatus, setTypingStatus] = useState(false); 

  const token = sessionStorage.getItem("token");
  const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  const isSelfChat = user._id === loggedInUser._id;
  const markMessagesAsSeen = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/messages/mark-seen/${user._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit("mark-as-seen", { from: user._id, to: loggedInUser._id });
    } catch (err) {
      console.error("❌ Error marking messages as seen", err);
    }
  };
   // ✅ Now use it inside useEffect
  useEffect(() => {
    if (!isSelfChat) {
      markMessagesAsSeen(); // Call when chat is opened or user changes
    }
  }, [user._id]); 
  useEffect(() => {
    if (!isSelfChat) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/messages/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages(res.data);
        } catch (err) {
          console.error("❌ Error fetching messages:", err);
        }
      };

      fetchMessages();

      const handleReceive = (msg) => {
        if (
          (msg.from === loggedInUser._id && msg.to === user._id) ||
          (msg.to === loggedInUser._id && msg.from === user._id)
        ) {
          setMessages((prev) => [...prev, { sender: msg.from, content: msg.content }]);
        }
      };
      const handleTyping = ({ from }) => {
        console.log("handleTyping: ");
        console.log(typingStatus);
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

  

  const handleSend = async () => {
    if (!newMsg.trim() || isSelfChat) {
      console.warn("⚠️ Cannot send message to self or empty message.");
      return;
    }

    const messageData = {
      to: user._id,
      from: loggedInUser._id,
      content: newMsg,
      timestamp: Date.now(),
    };
     socket.emit("send-msg", messageData);
      // setMessages((prev) => [...prev, { sender: loggedInUser._id, content: newMsg }]);
       setNewMsg("");
      socket.emit("stop-typing", { to: user._id, from: loggedInUser._id });
    console.time("SendMessage");
    try {
      await axios.post(
        "http://localhost:5000/api/messages",
        { receiver: user._id, content: newMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
    console.timeEnd("SendMessage"); 
  };
  const handleInputChange = (e) => {
    setNewMsg(e.target.value);
    console.log("handleInputChange");
    console.log("isTyping");
    console.log(isTyping);
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
        <div className={styles.warning}>⚠️ You cannot chat with yourself.</div>
      ) : (
        <>
          <h3>Chat with {user.username}</h3>
          <div className={styles.messages}>
  {messages.map((msg, i) => {
    const isSender = msg.sender === loggedInUser._id;
    return (
      <div
        key={i}
        className={`${styles.messageBubble} ${
          isSender ? styles.sent : styles.received
        }`}
      >
        {!isSender && <div className={styles.senderName}>{user.username}</div>}
        <div className={styles.messageContent}>
          <span>{msg.content}</span>
          <span className={styles.timestamp}>
            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
           {isSender && msg.seen && (
          <span className={styles.seenIndicator}>✓ Seen</span>
        )}
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
            <button onClick={handleSend}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;

