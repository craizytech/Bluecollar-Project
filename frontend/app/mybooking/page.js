"use client"
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BookingHistoryList from './_component/BookingHistoryList'


function MyBooking() {

  const [bookingHistory, setBookingHistory] = useState([]);



  // Get User Booking History
  const GetUserBookingHistory=()=>{
    setBookingHistory();
  }

  return (
    <div className='my-10 mx-5 md:mx-36'>
    <h2 className='font-bold text-[20px] my-2'>My Bookings</h2>
      <Tabs defaultValue="booked" className="w-full">
  <TabsList className="w-full justify-start">
    <TabsTrigger value="booked">Booked</TabsTrigger>
    <TabsTrigger value="completed">Completed</TabsTrigger>
  </TabsList>
  <TabsContent value="booked">
  <BookingHistoryList bookingHistory={bookingHistory}/>
  </TabsContent>
  <TabsContent value="completed">
  
  </TabsContent>
</Tabs>

    </div>
  )
}

export default MyBooking