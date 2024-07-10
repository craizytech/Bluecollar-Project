"use client";
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetClose, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Day } from 'react-day-picker';
import moment from 'moment';

async function checkSlotBooked(date) {
    const response = await fetch(`http://localhost:5000/api/bookings/check?date=${date}`);
    if (response.ok) {
        const data = await response.json();
        return data.isBooked;
    }
    return false;
}

async function fetchProviderId(serviceId, categoryId) {
    try {
        const response = await fetch(`http://localhost:5000/api/services/category/${categoryId}`);
        if (response.ok) {
            const data = await response.json();
            const service = data.find(service => service.service_id === serviceId);
            if (service) {
                return service.provider_id;
            }
        }
        throw new Error('Provider ID not found for the given service');
    } catch (error) {
        console.error('Error fetching provider ID:', error);
        return null; // Handle appropriately in your application
    }
}

function BookingSection({ children, serviceId, categoryId, onBookingSuccess }) {
    console.log('BookingSection Props:', { serviceId, categoryId }); // Log props to verify

    const [providerId, setProviderId] = useState(null);
    const [date, setDate] = useState(null);
    const [location, setLocation] = useState('');

    const isDateSelected = date !== null;

    useEffect(() => {
        // Fetch provider ID when serviceId or categoryId changes
        const fetchProvider = async () => {
            const id = await fetchProviderId(serviceId, categoryId);
            setProviderId(id);
        };
        fetchProvider();
    }, [serviceId, categoryId]);

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
    };

    const handleSaveBooking = async () => {
        try {
            const bookingData = {
                service_id: serviceId,
                provider_id: providerId,
                booking_date: moment(date).toISOString(),
                location: location
            };

            console.log('Booking Data:', bookingData);

            const response = await fetch('http://localhost:5000/api/bookings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
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
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            toast('Error saving booking');
        }
    };

    const renderDay = async (day) => {
        const isBooked = await checkSlotBooked(moment(day).toISOString());
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
                <SheetContent className="overflow-auto">
                    <SheetHeader>
                        <SheetTitle>Book A Service</SheetTitle>
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
