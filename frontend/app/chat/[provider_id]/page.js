"use client";
import React, { useEffect, useState } from 'react';
import ChatComponent from '../_components/ChatComponent';

function ChatPage() {
  const [userId, setUserId] = useState(null);
  const [receiverId, setReceiverId] = useState(null);

  useEffect(() => {
    // Fetch userId from localStorage on client-side
    const storedUserId = localStorage.getItem('user_id');
    setUserId(storedUserId);

    // Extract receiverId from the URL
    const params = new URLSearchParams(window.location.search);
    const receiverIdFromUrl = params.get('receiverId');
    setReceiverId(receiverIdFromUrl);
  }, []);

  return (
    <div>
      {userId && receiverId ? (
        <ChatComponent userId={userId} receiverId={receiverId} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ChatPage;
