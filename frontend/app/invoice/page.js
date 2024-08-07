"use client"
import React, { useEffect, useState } from 'react'
import CreateInvoice from './_components/CreateInvoice'

function page() {
  const [bookingId, setBookingId] = useState(null);
  const [receiverId, setReceiverId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingIdFromUrl = params.get('bookingId');
    const receiverIdFromUrl = params.get('receiverId');

    console.log('Booking ID from URL:', bookingIdFromUrl);
    console.log('Receiver ID from URL:', receiverIdFromUrl);

    setBookingId(bookingIdFromUrl);
    setReceiverId(receiverIdFromUrl);
  }, []);

  return (
    <div>
        <CreateInvoice bookingId={bookingId}  receiverId={receiverId}/>
    </div>
  )
}

export default page