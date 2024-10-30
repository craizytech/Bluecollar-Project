"use client";
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingHistoryList from './_component/BookingHistoryList';
import { toast, Toaster } from 'sonner';
import Spinner from '../_components/spinner/Spinner';

function MyBooking() {
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setBookingHistory(data);
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

  if (loading) return <Spinner />;
  if (error) {
    toast.error(`Error: ${error}`);
    return <p>Error loading bookings</p>;
  }

  return (
    <div className='my-10 mx-5 md:mx-36'>
      <h2 className='font-bold text-[20px] my-2'>My Bookings</h2>
      <Toaster />
      <Tabs defaultValue="bookedClient" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="bookedClient">Booked Services</TabsTrigger>
          <TabsTrigger value="completedClient">Completed Services</TabsTrigger>
        </TabsList>
        <TabsContent value="bookedClient">
          <BookingHistoryList bookingHistory={bookingHistory} role="client" statuses={['pending', 'declined', 'accepted']} />
        </TabsContent>
        <TabsContent value="completedClient">
          <BookingHistoryList bookingHistory={bookingHistory} role="client" statuses={['completed']} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MyBooking;
