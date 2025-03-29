// LiveDataTd.jsx
import React, { useEffect, useState, useMemo } from "react";
import "../../style.css";
import io from "socket.io-client";

// Track active subscriptions and socket instances
const socketCache = new Map();

const getCachedSocket = (topic) => {
  if (!socketCache.has(topic)) {
    const newSocket = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    socketCache.set(topic, {
      socket: newSocket,
      subscribers: 0,
      messageHandler: null,
    });
  }
  return socketCache.get(topic);
};

const LiveDataTd = ({ topic, onTimestampUpdate }) => {
  const [liveMessage, setLiveMessage] = useState(null); // Changed to null for clearer initial state
  const isFFT = useMemo(() => topic.split("|")[1] === "fft", [topic]);

  useEffect(() => {
    if (isFFT) return;

    const topicEntry = getCachedSocket(topic);
    const { socket } = topicEntry;

    const handleMessage = (data) => {
      const messageData = data?.message?.message?.message;
      const timestamp = data?.message?.timestamp;
      setLiveMessage(messageData);
      if (timestamp && onTimestampUpdate) {
        onTimestampUpdate(topic, timestamp); // Pass topic to identify which row
      }
    };

    if (topicEntry.subscribers === 0) {
      socket.emit("subscribeToTopic", topic);
      socket.on("liveMessage", handleMessage);
      topicEntry.messageHandler = handleMessage;
    }

    topicEntry.subscribers++;

    return () => {
      topicEntry.subscribers--;
      if (topicEntry.subscribers === 0) {
        socket.off("liveMessage", topicEntry.messageHandler);
        socket.emit("unsubscribeFromTopic", topic);
        socket.disconnect();
        socketCache.delete(topic);
      }
    };
  }, [topic, isFFT, onTimestampUpdate]);

  return isFFT ? (
    <td style={{ fontWeight: "bolder" }}>N/A</td>
  ) : (
    <td style={{ fontWeight: "bolder", background: "#34495e", color: "rgb(255, 255, 255)" }}>
      {liveMessage !== null ? liveMessage : "-"}
    </td>
  );
};

export default React.memo(LiveDataTd);