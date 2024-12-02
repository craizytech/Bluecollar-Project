import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetClose, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import moment from 'moment';
import counties from "@/app/data/counties";
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setAddress, setLocation } from '@/app/store/slices/location';

const socket = io('http://localhost:5000');

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

// Fetch the service duration
async function fetchServiceDetails(serviceId) {
    try {
        const response = await fetch(`http://localhost:5000/api/services/${serviceId}`);
        if (response.ok) {
            const data = await response.json();
            return {
                providerId: data.provider_id,
                serviceDuration: data.service_duration // Assuming service_duration is returned
            };
        } else {
            console.error('Failed to fetch service details, status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching service details:', error);
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
    const dispatch = useDispatch();
    const geocodedLocation = useSelector(state => state.location.address);
    const { latitude, longitude } = useSelector(state => state.location.location);
    const [providerId, setProviderId] = useState(null);
    const [date, setDate] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const [serviceDescription, setServiceDescription] = useState('');
    const [serviceDuration, setServiceDuration] = useState(null);
    const [error, setError] = useState({ date: false, location: false, description: false });
    const [suggestedAddresses, setSuggestedAddresses] = useState([]);
    const [inputAddress, setInputAddress] = useState(geocodedLocation);
    const [selectedLatitude, setSelectedLatitude] = useState(null);
    const [selectedLongitude, setSelectedLongitude] = useState(null);
    
    const today = new Date();

    useEffect(() => {
        const handleNotification = (notification) => {
            // Display the notification to the user
            toast(notification.message, {
                style: {
                    backgroundColor: "blue", // You can customize this
                    color: "white"
                }
            });
        };

        // Listen for notifications
        socket.on('notification', handleNotification);

        // Cleanup on unmount
        return () => {
            socket.off('notification', handleNotification);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (serviceId) {
                try {
                    const serviceDetails = await fetchServiceDetails(serviceId);
                    
                    // Check if serviceDetails is defined and has the required properties
                    if (serviceDetails && serviceDetails.providerId && serviceDetails.serviceDuration) {
                        setProviderId(serviceDetails.providerId);
                        setServiceDuration(serviceDetails.serviceDuration);
                        generateTimeSlots(serviceDetails.serviceDuration);
                    } else {
                        console.error("Service details are incomplete:", serviceDetails);
                    }
                } catch (error) {
                    console.error("Error fetching service details:", error);
                    // Optionally set a state to inform the user of the error
                }
            }
            
            try {
                const loc = await fetchUserLocation();
                setLocation(loc);
            } catch (error) {
                console.error("Error fetching user location:", error);
                // Handle location fetching error if needed
            }
        };
    
        fetchData();
    }, [serviceId]);
    

    const generateTimeSlots = (duration) => {
        const slots = [];
        const start = moment('08:00', 'HH:mm');
        const end = moment('19:00', 'HH:mm');

        const roundedDuration = Math.ceil(duration / 60);
        
        // Create time slots based on the duration
        while (start.hour() + roundedDuration <= end.hour()) {
            slots.push(start.format('hh:mm A'));
            start.add(roundedDuration, 'hours'); // Increment by rounded duration in hours
        }

        setTimeSlots(slots);
    }

    const handleLocationChange = async (e) => {
        const query = e.target.value;
        setInputAddress(query)
        setSuggestedAddresses([]);
        setShowDropdown(false);

       
        if (query) {
            try {
                // Fetch address suggestions from Nominatim API
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=KE`);
                const data = await response.json();
                setSuggestedAddresses(data);  // Store the suggested addresses
                setShowDropdown(true);
            } catch (error) {
                console.error('Error fetching address suggestions:', error);
                setSuggestedAddresses([]);
                setShowDropdown(false);
            }
        }
    };

    const handleSelectAddress = (address) => {
        setInputAddress(address.display_name);
        setShowDropdown(false);

        const lat = address.lat;
        const lon = address.lon;

        console.log("Location before sending:", location);

        setLocation({ latitude: lat, longitude: lon });
    };

    const handleDescriptionChange = (e) => {
        setServiceDescription(e.target.value);
    };

    const handleSaveBooking = async () => {
        let hasError = false;

        // Validate required fields
        if (!date || !time || !location || !serviceDescription) {
            setError(prev => ({
                ...prev,
                date: !date,
                time: !time,
                location: !location,
                description: !serviceDescription,
            }));
            hasError = true;
        }
        if (hasError) return;

        const selectedDate = moment(date).startOf('day');
        const selectedTime = moment(time, 'hh:mm A');
   
        const start_time = selectedDate
        .set({
            hour: selectedTime.hour(),
            minute: selectedTime.minute(),
            second: 0,
            millisecond: 0
        }).format();

        const booking_date = selectedDate.format();
        const end_time = moment(start_time).add(serviceDuration, 'minutes').format();

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
                toast(' Provider is not available');
                return;
            }

            let locationToSend = '';

            if (latitude && longitude) {
                locationToSend = `${latitude}, ${longitude}`; // Use geocoded location (lat, lon)
            } else if (location && location.latitude && location.longitude) {
                locationToSend = `${location.latitude}, ${location.longitude}`; // Use selected address location (lat, lon)
            } else if (inputAddress) {
                locationToSend = inputAddress; // Fallback to input address if no location selected
            } else {
                setError(prev => ({
                    ...prev,
                    location: true
                }));
                toast('Please select a location.');
                return;
            }

            const bookingData = {
                service_id: Number(serviceId),
                provider_id: providerId,
                booking_date,
                start_time,
                end_time,
                location: locationToSend,
                description: serviceDescription,
            };

            console.log("booking data", bookingData)

            const response = await fetch('http://localhost:5000/api/bookings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                const bookingDataResponse = await response.json(); // Capture response data
                const bookingId = bookingDataResponse.booking_id;

                toast('Service booked successfully!', {
                    style: {
                        backgroundColor: "green",
                        color: "white"
                    }
                });
                if (onBookingSuccess) {
                    onBookingSuccess(bookingId);
                }
            } else {
                const errorData = await response.json();
                toast(`${errorData.error}`, {
                    style: {
                        backgroundColor: "red",
                        color: "white"
                    }
                });
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            toast('Error saving booking', {
                style: {
                    backgroundColor: "red",
                    color: "white"
                }
            });
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
                            Select a date and time, enter your location, and provide a description of the service you are seeking.
                        </p>
                        <div>
                            <div className="flex flex-col gap-5 items-baseline">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className={`rounded-md border ${error.date ? 'border-red-500' : 'border-gray-300'}`}
                                    modifiers={modifiers}
                                />
                                {error.date && <p className="text-red-500">Please select a date.</p>}
                            </div>
                            {/* Time Slot Picker */}
                            <div>
                                <div className="mt-4">
                                    <label htmlFor="time" className="block text-gray-700">Select Time:</label>
                                    <select
                                        type="time"
                                        id="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className={`rounded-md border p-2 w-full ${error.time ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select Time</option>
                                        {timeSlots.map((slot, index) => (
                                            <option key={index} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                    {error.time && <p className="text-red-500">Time is required.</p>}
                                </div>
                            </div>
                            {/* Location Input */}
                            <div className="relative mt-4">
                                <input
                                    type="text"
                                    value={inputAddress}
                                    onChange={handleLocationChange}
                                    placeholder="Enter location"
                                    className={`rounded-md border p-2 w-full" ${error.location ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {error.location && <p className="text-red-500">Location is required.</p>}
                                {showDropdown && (
                                    <ul className="absolute z-10 bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto">
                                        {suggestedAddresses.map((address, index) => (
                                            <li
                                                key={index}
                                                className="p-2 cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSelectAddress(address)}
                                            >
                                                {address.display_name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {/* Description Input */}
                            <div className="mt-4">
                                <textarea
                                    value={serviceDescription}
                                    onChange={handleDescriptionChange}
                                    placeholder="Describe the service you are seeking"
                                    className={`rounded-md border p-2 w-full h-32 ${error.description ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {error.description && <p className="text-red-500">Description is required.</p>}
                            </div>
                        </div>
                    </SheetHeader>
                    <SheetFooter className="mt-5">
                        <SheetClose asChild>
                            <div className='flex gap-5'>
                                <Button
                                    disabled={!date || !location || !serviceDescription || !time}
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
