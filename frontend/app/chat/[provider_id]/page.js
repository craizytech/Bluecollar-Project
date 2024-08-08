"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatComponent from '../_components/ChatComponent';

function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);

  useEffect(() => {
    // Fetch userId from localStorage on client-side
    const storedUserId = localStorage.getItem('user_id');
    setUserId(storedUserId);

    // Extract receiverId, bookingId, and invoiceId from the URL
    const params = new URLSearchParams(window.location.search);
    const receiverIdFromUrl = params.get('receiverId');
    const bookingIdFromUrl = params.get('bookingId');
    const invoiceIdFromUrl = params.get('invoiceId');

    setReceiverId(receiverIdFromUrl);
    setBookingId(bookingIdFromUrl);
    setInvoiceId(invoiceIdFromUrl);
  }, []);

  return (
    <div>
      {userId && receiverId && bookingId ? (
        <ChatComponent 
          userId={userId} 
          receiverId={receiverId} 
          bookingId={bookingId} 
          invoiceId={invoiceId} 
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ChatPage;
