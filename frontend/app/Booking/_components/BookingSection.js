"use client";
import React, { useState, useEffect, useContext } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetClose, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Day } from 'react-day-picker';
import moment from 'moment';

async function checkSlotBooked(date) {
    try {
        console.log(`Checking if slot is booked for date: ${date}`);
        const response = await fetch(`http://localhost:5000/api/bookings/check?date=${date}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`Slot booked status for date ${date}:`, data.isBooked);
            return data.isBooked;
        } else {
            console.error('Failed to check slot booking, status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error checking slot booked:', error);
        return false;
    }
}

    async function fetchProviderId(serviceId) {
        try {
            console.log(`Fetching provider ID for service ID: ${serviceId}`);
            const response = await fetch(`http://localhost:5000/api/services/${serviceId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched services data:', data);

                // Assuming data is an object with service details, not an array
                if (data.service_id === Number(serviceId)) {
                    console.log(`Provider ID for service ID ${serviceId}:`, data.provider_id);
                    return data.provider_id;
                } else {
                    console.warn(`Provider ID not found for service ID ${serviceId}`);
                    return null;
                }
            } else {
                console.error('Failed to fetch provider ID, status:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error fetching provider ID:', error);
            return null;
        }
    }

function BookingSection({ children, serviceId, onBookingSuccess }) {
    const [providerId, setProviderId] = useState(null);
    const [date, setDate] = useState(null);
    const [location, setLocation] = useState('');

    const isDateSelected = date !== null;

    useEffect(() => {
        if (serviceId) {
            console.log('Fetching provider ID on component mount or props change');
            const fetchProvider = async () => {
                const id = await fetchProviderId(serviceId);
                if (id) {
                    setProviderId(id);
                } else {
                    console.warn('Provider ID is not available');
                }
            };
            fetchProvider();
        } else {
            console.warn('Service ID is missing, skipping provider ID fetch');
        }
    }, [serviceId]);

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
        console.log('Location changed to:', e.target.value);
    };

    const handleSaveBooking = async () => {
        try {
            if (!providerId) {
                console.warn('Provider ID is not set, cannot save booking');
                toast('Error: Provider ID is not available');
                return;
            }

            const bookingData = {
                service_id: Number(serviceId),
                provider_id: providerId,
                booking_date: moment(date).toISOString(),
                location: location
            };

            console.log('Booking Data to be sent:', bookingData);

            const response = await fetch('http://localhost:5000/api/bookings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                toast('Service booked successfully!');
                if (onBookingSuccess) {
                    onBookingSuccess();
                }
            } else {
                const errorData = await response.json();
                toast(`Error: ${errorData.error}`);
                console.error('Error response data:', errorData);
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            toast('Error saving booking');
        }
    };

    const renderDay = async (day) => {
        const isoDate = moment(day).toISOString();
        console.log(`Rendering day ${day} - Checking if booked`);
        const isBooked = await checkSlotBooked(isoDate);
        console.log(`Day ${day} - Is booked: ${isBooked}`);
        return (
            <Day
                day={day}
                disabled={isBooked}
                className={isBooked ? 'bg-red-500 text-white' : ''}
            >
                {day.getDate()}
            </Day>
        );
    };

    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    {children}
                </SheetTrigger>
                <SheetContent className="overflow-auto"
                aria-describedby="booking-descroption">
                    <SheetHeader>
                        <SheetTitle>Book A Service</SheetTitle>
                        <p id="booking-description">Select a date and enter your location to book a service.</p>
                        <div>
                            <div>
                                <h2 className='font-bold mb-5'>Select Date to book a Service</h2>
                            </div>
                            <div className="calendar-wrapper">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border"
                                    renderDay={renderDay}
                                />
                            </div>
                            <input
                                type="text"
                                value={location}
                                onChange={handleLocationChange}
                                placeholder="Enter location"
                                className="rounded-md border mt-4 p-2 w-full"
                            />
                        </div>
                    </SheetHeader>
                    <SheetFooter className="mt-5">
                        <SheetClose asChild>
                            <div className='flex gap-5'>
                                <Button variant="destructive">Cancel</Button>
                                <Button
                                    disabled={!isDateSelected}
                                    onClick={handleSaveBooking}
                                >
                                    Book
                                </Button>
                            </div>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default BookingSection;
