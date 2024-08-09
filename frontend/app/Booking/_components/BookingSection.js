import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetClose, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import moment from 'moment';
import counties from "@/app/data/counties";

// async function fetchBookedDates(providerId) {
//     try {
//         const response = await fetch(`http://localhost:5000/api/bookings/booked-dates?providerId=${providerId}`, {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//             }
//         });
//         if (response.ok) {
//             const data = await response.json();
//             return data.bookedDates.map(date => moment(date).startOf('day').toDate());
//         } else {
//             console.error('Failed to fetch booked dates, status:', response.status);
//             return [];
//         }
//     } catch (error) {
//         console.error('Error fetching booked dates:', error);
//         return [];
//     }
// }

async function fetchProviderId(serviceId) {
    try {
        const response = await fetch(`http://localhost:5000/api/services/${serviceId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.service_id === Number(serviceId)) {
                return data.provider_id;
            } else {
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

async function fetchUserLocation() {
    try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            return data.user_location || '';
        } else {
            console.error('Failed to fetch user location, status:', response.status);
            return '';
        }
    } catch (error) {
        console.error('Error fetching user location:', error);
        return '';
    }
}

function BookingSection({ children, serviceId, onBookingSuccess }) {
    const [providerId, setProviderId] = useState(null);
    const [date, setDate] = useState(null);
    const [location, setLocation] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [filteredCounties, setFilteredCounties] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const [serviceDescription, setServiceDescription] = useState(''); // New state for service description
    const today = new Date(); // Get today's date

    useEffect(() => {
        const fetchData = async () => {
            if (serviceId) {
                const id = await fetchProviderId(serviceId);
                if (id) {
                    setProviderId(id);
                    // const booked = await fetchBookedDates(id);
                    // setBookedDates(booked);
                }
            }
            const loc = await fetchUserLocation();
            setLocation(loc);
        };
        fetchData();
    }, [serviceId]);

    const handleLocationChange = (e) => {
        const query = e.target.value;
        setSearchLocation(query);

        if (query) {
            const filtered = counties.filter(county =>
                county.toLowerCase().startsWith(query.toLowerCase())
            );
            setFilteredCounties(filtered);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }

        setLocation(query);
    };

    const handleSelectCounty = (county) => {
        setLocation(county);
        setSearchLocation(county);
        setShowDropdown(false);
    };

    const handleDescriptionChange = (e) => {
        setServiceDescription(e.target.value);
    };

    const handleSaveBooking = async () => {
        if (!date) {
            toast('Please select a date.');
            return;
        }

        const isoDate = moment(date).startOf('day').toISOString();

        if (bookedDates.some(d => moment(d).startOf('day').toISOString() === isoDate)) {
            toast('Selected date is already booked. Please choose a different date.', {
                style: { 
                    backgroundColor: '#f8d7da',
                    color: '#721c24'
                }
            });
            return;
        }

        try {
            if (!providerId) {
                toast('Error: Provider ID is not available');
                return;
            }

            const bookingData = {
                service_id: Number(serviceId),
                provider_id: providerId,
                booking_date: isoDate,
                location: location,
                description: serviceDescription // Include service description
            };

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
                // if (onBookingSuccess) {
                //     onBookingSuccess();
                // }
            } else {
                const errorData = await response.json();
                toast(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            toast('Error saving booking');
        }
    };

    const modifiers = {
        disabled: {
            before: today, 
            // dates: bookedDates
        }
    };

    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    {children}
                </SheetTrigger>
                <SheetContent className="overflow-auto" aria-describedby="booking-description">
                    <SheetHeader>
                        <SheetTitle>Book A Service</SheetTitle>
                        <p id="booking-description">
                            Select a date, enter your location, and provide a description of the service you are seeking.
                        </p>
                        <div>
                            <div className="flex flex-col gap-5 items-baseline">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border"
                                    // modifiers={modifiers}
                                />
                            </div>
                            {/* Time Slot Picker */}
                            <div>

                            </div>
                            <div className="relative mt-4">
                                <input
                                    type="text"
                                    value={location}
                                    onChange={handleLocationChange}
                                    placeholder="Enter location"
                                    className="rounded-md border p-2 w-full"
                                />
                                {showDropdown && (
                                    <ul className="absolute z-10 bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto">
                                        {filteredCounties.map((county, index) => (
                                            <li
                                                key={index}
                                                className="p-2 cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSelectCounty(county)}
                                            >
                                                {county}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="mt-4">
                                <textarea
                                    value={serviceDescription}
                                    onChange={handleDescriptionChange}
                                    placeholder="Describe the service you are seeking"
                                    className="rounded-md border p-2 w-full h-32"
                                />
                            </div>
                        </div>
                    </SheetHeader>
                    <SheetFooter className="mt-5">
                        <SheetClose asChild>
                            <div className='flex gap-5'>
                                <Button
                                    disabled={!date}
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
