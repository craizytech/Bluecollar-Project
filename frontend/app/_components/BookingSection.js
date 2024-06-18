"use client";
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetFooter, SheetClose, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function BookingSection({ children }) {
    const [date, setDate] = useState(null);
    const [serviceId, setServiceId] = useState(null);
    const [providerId, setProviderId] = useState(null);
    const [location, setLocation] = useState('');

    const isDateSelected = date !== null;

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
    };

    const saveBooking = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/bookings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    service_id: serviceId,
                    provider_id: providerId,
                    booking_date: date.toISOString(),
                    location: location
                })
            });

            if (response.ok) {
                console.log('Booking successful');
                toast('Service Booked sucessfully!');
            } else {
                console.error('Booking failed:', response.statusText);
                toast('Booking failed');
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            toast('Error saving booking');
        }
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
                        <SheetDescription>
                            <div>
                                <h2 className='font-bold mb-5'>Select Date to book a Service</h2>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border"
                                />
                                <input type="text" value={location} onChange={handleLocationChange} placeholder="Enter location" className="rounded-md border mt-4 p-2 w-full" />
                            </div>
                        </SheetDescription>
                    </SheetHeader>
                    <SheetFooter className="mt-5">
                        <SheetClose asChild>
                            <div className='flex gap-5'>
                                <Button variant="destructive" className="">Cancel</Button>
                                <Button
                                    disabled={!isDateSelected}
                                    onClick={saveBooking}
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
