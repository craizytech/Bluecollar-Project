import { Calendar, MapPin, User, Check, X, Clock, MessageSquare } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

function BookingHistoryList({ bookingHistory, role, userId, statuses = [] }) {
  const [updatedBookings, setUpdatedBookings] = useState(bookingHistory);
  const [activeTab, setActiveTab] = useState(statuses[0] || '');

  useEffect(() => {
    setUpdatedBookings(bookingHistory);
  }, [bookingHistory]);


  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Booking status updated successfully');
        const updatedBookingIndex = updatedBookings.findIndex(b => b.booking_id === bookingId);
        const updatedBooking = { ...updatedBookings[updatedBookingIndex], status: newStatus };
        const updatedBookingList = [...updatedBookings];
        updatedBookingList[updatedBookingIndex] = updatedBooking;
        setUpdatedBookings(updatedBookingList);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update booking status');
      }
    } catch (err) {
      toast.error('An error occurred while updating booking status');
    }
  };

  // Separate bookings into pending services and completed services
  const pendingBookings = updatedBookings.filter(
    booking => booking.status !== 'completed' && (role === 'client' ? booking.client_id === userId : booking.provider_id === userId)
  );

  const completedBookings = updatedBookings.filter(
    booking => booking.status === 'completed' && (role === 'client' ? booking.client_id === userId : booking.provider_id === userId)
  );

  // Group pending bookings by status
  const groupedPendingBookings = ['pending', 'accepted', 'declined'].reduce((acc, status) => {
    acc[status] = pendingBookings.filter(booking => booking.status.trim().toLowerCase() === status);
    return acc;
  }, {});

  return (
    <div className='mx-5 md:mx-36'>
      {statuses.includes('completed') ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {completedBookings.length ? completedBookings.map((booking, index) => (
            <div key={index} className='flex gap-4 border rounded-lg p-4 mb-5'>
              <div className='flex flex-col gap-2'>
                <h2 className='font-bold'>{booking.service_name}</h2>
                {role === 'client' ? (
                  <>
                    <h2 className='flex gap-2 text-primary'>
                      <User /> {booking.provider_name}
                    </h2>
                    <div className='text-green-500'>
                      Service has been completed. 
                      <Link href={`reviews/writeReview?service_id=${booking.service_id}&provider_id=${booking.provider_id}`} className='ml-2 text-blue-500'>
                      Leave a review?
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className='flex gap-2 text-primary'>
                      <User /> {booking.client_name}
                    </h2>
                    <div className='text-green-500'>
                      Service has been completed.
                      <Link href={`/reviews/${booking.service_id}`} className='ml-2 text-blue-500'>
                        View review
                      </Link>
                    </div>
                  </>
                )}
                {booking.status !== 'completed' && (
                  <>
                    <h2 className='flex gap-2 text-gray-500'>
                      <MapPin className='text-primary' /> {booking.location}
                    </h2>
                    <h2 className='flex gap-2 text-gray-500'>
                      <Calendar className='text-primary' /> Service on: {booking.booking_date}
                    </h2>
                  </>
                )}
              </div>
            </div>
          )) : (
            <p>No completed bookings found.</p>
          )}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='flex space-x-2 border-b border-gray-300 bg-transparent mb-2'>
            {['pending', 'accepted', 'declined'].map(status => (
              <TabsTrigger
                key={status}
                value={status}
                className={`px-8 py-2 border-b-2 ${activeTab === status ? 'border-blue-500 font-bold bg-white' : 'border-gray-300 bg-gray-100'}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          {['pending', 'accepted', 'declined'].map(status => (
            <TabsContent key={status} value={status}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {groupedPendingBookings[status]?.length ? groupedPendingBookings[status].map((booking, index) => (
                  <div key={index} className='flex gap-4 border rounded-lg p-4 mb-5'>
                    <div className='flex flex-col gap-2'>
                      <h2 className='font-bold'>{booking.service_name}</h2>
                      {role === 'client' ? (
                        <>
                          <h2 className='flex gap-2 text-primary'>
                            <User /> {booking.provider_name}
                          </h2>
                          {booking.status === 'declined' && (
                            <div className='text-red-500'>
                              Booking has been declined.
                            </div>
                          )}
                          {booking.status === 'accepted' && (
                            <div className='flex items-center gap-2 text-green-700'>
                              <div>Booking has been accepted. Chat with your provider.</div>
                              <Link href={`/chat/${booking.provider_id}?receiverId=${booking.provider_id}`}
                                 className='text-blue-500'>
                                  <MessageSquare className='inline' />
                              </Link>
                            </div>
                          )}
                          {(booking.status !== 'declined' && booking.status !== 'accepted') && (
                            <>
                              <h2 className='flex gap-2 text-gray-500'>
                                <MapPin className='text-primary' /> {booking.location}
                              </h2>
                              <h2 className='flex gap-2 text-gray-500'>
                                <Calendar className='text-primary' /> Service on: {booking.booking_date}
                              </h2>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <h2 className='flex gap-2 text-primary'>
                            <User /> {booking.client_name}
                          </h2>
                          <div className='flex gap-2'>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(booking.booking_id, 'accepted')}
                                  className='flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg'
                                >
                                  <Clock /> Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(booking.booking_id, 'declined')}
                                  className='flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg'
                                >
                                  <X /> Decline
                                </button>
                              </>
                            )}
                            {booking.status === 'accepted' && (
                              <button
                                onClick={() => handleUpdateStatus(booking.booking_id, 'completed')}
                                className='flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg'
                              >
                                <Check /> Mark Complete
                              </button>
                            )}
                          </div>
                          {booking.status === 'declined' && (
                            <div className='text-red-500'>
                              Booking declined.
                            </div>
                          )}
                          {booking.status === 'accepted' && (
                            <div className='flex items-center gap-2 text-green-700'>
                              <div>Accepted booking. Chat with your client.</div>
                              <Link href={`/chat/${booking.client_id}?receiverId=${booking.client_id}`}
                                 className='text-blue-500'>
                                  <MessageSquare className='inline' />
                              </Link>
                            </div>
                          )}
                          {(booking.status !== 'declined' && booking.status !== 'accepted') && (
                            <>
                              <h2 className='flex gap-2 text-gray-500'>
                                <MapPin className='text-primary' /> {booking.location}
                              </h2>
                              <h2 className='flex gap-2 text-gray-500'>
                                <Calendar className='text-primary' /> Service on: {booking.booking_date}
                              </h2>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )) : (
                  <p>No bookings found.</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

export default BookingHistoryList;
