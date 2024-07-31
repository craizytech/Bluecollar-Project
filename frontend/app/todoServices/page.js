"use client";
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingHistoryList from '../mybooking/_component/BookingHistoryList';
import { toast, Toaster } from 'sonner';

function ToDoServices() {
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const deduplicateBookings = (bookings) => {
    const seen = new Set();
    return bookings.filter(booking => {
      const isDuplicate = seen.has(booking.booking_id);
      seen.add(booking.booking_id);
      return !isDuplicate;
    });
  };

  const GetUserBookingHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const deduplicatedData = deduplicateBookings(data);
        setBookingHistory(deduplicatedData);
        console.log('Fetched Booking History:', deduplicatedData); // Log the deduplicated data
        setLoading(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch bookings');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred while fetching bookings');
      setLoading(false);
    }
  };

  useEffect(() => {
    GetUserBookingHistory();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) {
    toast.error(`Error: ${error}`);
    return <p>Error loading bookings</p>;
  }

  return (
    <div className='my-10 mx-5 md:mx-36'>
      <h2 className='font-bold text-[20px] my-2'>To Do Services</h2>
      <Toaster />
      <Tabs defaultValue="pendingProvider" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pendingProvider">Pending Services</TabsTrigger>
          <TabsTrigger value="completedProvider">Completed Services</TabsTrigger>
        </TabsList>
        <TabsContent value="pendingProvider">
          <BookingHistoryList bookingHistory={bookingHistory} role="provider" statuses={['pending', 'declined', 'accepted']} />
        </TabsContent>
        <TabsContent value="completedProvider">
          <BookingHistoryList bookingHistory={bookingHistory} role="provider" statuses={['completed']} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ToDoServices;