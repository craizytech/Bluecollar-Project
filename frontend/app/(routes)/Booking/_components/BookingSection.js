"use client";
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetFooter, SheetClose, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Day } from 'react-day-picker';
import moment from 'moment';
import { createBooking, checkSlotBooked } from '../../../_services/GlobalApi';

function BookingSection({ children }) {
    const [date, setDate] = useState(null);
    const [serviceId, setServiceId] = useState(null);
    const [providerId, setProviderId] = useState(null);
    const [location, setLocation] = useState('');

    const isDateSelected = date !== null;

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

            await createBooking(bookingData);
            toast('Service Booked successfully!');
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
                        <SheetDescription>
                            <div>
                                <h2 className='font-bold mb-5'>Select Date to book a Service</h2>
                                <div className="calendar-wrapper">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="rounded-md border"
                                        renderDay={renderDay}
                                    />
                                </div>
                                {/* <input type="text" value={location} onChange={handleLocationChange} placeholder="Enter location" className="rounded-md border mt-4 p-2 w-full" /> */}
                            </div>
                        </SheetDescription>
                    </SheetHeader>
                    <SheetFooter className="mt-5">
                        <SheetClose asChild>
                            <div className='flex gap-5'>
                                <Button variant="destructive" className="">Cancel</Button>
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