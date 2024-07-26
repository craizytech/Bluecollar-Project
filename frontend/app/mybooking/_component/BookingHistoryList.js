import { Calendar, MapPin, User } from 'lucide-react'
import React from 'react'

function BookingHistoryList(bookingHistory) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
    <div className='flex gap-4 border
    rounded-lg p-4 mb-5'>
    <div className='flex flex-col gap-2'>
        <h2 className='font-bold'>Business Name</h2>
        <h2 className='flex gap-2 text-primary'> <User/>Contact Person</h2>
        <h2 className='flex gap-2 text-gray-500'> <MapPin className='text-primary'/>Address</h2>
        <h2 className='flex gap-2 text-gray-500'>
         <Calendar className='text-primary'/>
         Service on: </h2>
    </div>
    </div>
    </div>
  )
}

export default BookingHistoryList