"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, Mail, MapPin, Phone, Share, User } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCategoryId } from '@/app/store/slices/categorySlice';
import Spinner from '@/app/_components/spinner/Spinner';

function UserProfile({ setServiceId }) {
    const searchParams = useSearchParams();
    const serviceId = searchParams.get('serviceId');
    const dispatch = useDispatch();
    const [providerDetails, setProviderDetails] = useState({});
    const [serviceDetails, setServiceDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [geocodedAddress, setGeocodedAddress] = useState('');

    const getGeocodedAddress = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=672958dc30760969524851ktj2e0ae5`
            );
            const data = await response.json();
            if (data && data.address) {
                const fullAddress = data.address;
                return `${fullAddress.road || ''}, ${fullAddress.city || ''}, ${fullAddress.state || ''}`;
            } else {
                return 'No address found';
            }
        } catch (error) {
            console.error('Geocoding Error:', error);
            return 'Error fetching address';
        }
    };

    useEffect(() => {
        if (!serviceId) {
            return;
        }

        async function fetchData() {
            try {
                setLoading(true)
                const token = localStorage.getItem('access_token');
                if (!token) {
                    console.error('No token found in localStorage');
                    return;
                }

                const SERVICE_DETAILS_URL = `http://localhost:5000/api/services/${serviceId}`;

                const serviceResponse = await fetch(SERVICE_DETAILS_URL, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (serviceResponse.ok) {
                    const serviceData = await serviceResponse.json();
                    console.log('Service details fetched:', serviceData);

                    setServiceDetails(serviceData);

                    // Fetch provider details using providerId
                    const PROVIDER_PROFILE_URL = `http://localhost:5000/api/users/profile/${serviceData.provider_id}`;
                    const providerResponse = await fetch(PROVIDER_PROFILE_URL, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    });

                    if (providerResponse.ok) {
                        const providerData = await providerResponse.json();
                        console.log('Provider details fetched:', providerData);

                        setProviderDetails({
                            provider_name: providerData.user_name,
                            provider_location: providerData.user_location,
                            provider_email: providerData.user_email,
                            provider_phone_number: providerData.user_phone_number,
                            provider_profile_picture: providerData.user_profile_picture,
                        });

                         // Extract latitude and longitude from provider_location (if it's in "lat,lon" format)
                         const location = providerData.user_location.split(',');
                         if (location.length === 2) {
                             const latitude = parseFloat(location[0]);
                             const longitude = parseFloat(location[1]);
 
                             // Get geocoded address
                             const address = await getGeocodedAddress(latitude, longitude);
                             setGeocodedAddress(address);
                         }

                        setServiceId(serviceId); 

                        if (serviceData.category_id) {
                            dispatch(setCategoryId(serviceData.category_id));
                        }                  
                    } else {
                        console.error('Failed to fetch provider profile:', providerResponse.statusText);
                    }
                } else {
                    console.error('Failed to fetch service details:', serviceResponse.statusText);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [serviceId, setServiceId, dispatch]);

    return (
        <div className='md:flex gap-4 items-center'>
            {loading ? (
                <div className="flex justify-center items-center">
                        <Spinner />
                </div>
            ) : (
                providerDetails.provider_profile_picture ? (
                <img
                    src={providerDetails.provider_profile_picture}
                    alt={providerDetails.provider_name || 'User profile picture'}
                    width={150}
                    height={200}
                    className='rounded-full h-[150px] object-cover'
                />
            ) : (
                <div className='rounded-full h-[150px] w-[150px] bg-gray-200'></div>
            )
            )}

            <div className='flex justify-between items-center w-full'>
                <div className='flex flex-col mt-4 md:mt-0 items-baseline gap-3'>
                    <h2 className='text-primary p-1 px-3 text-lg bg-purple-100 rounded-full'>
                        {serviceDetails.category_name || 'Not available'}
                    </h2>
                    <h3 className='text-[20px] font-bold'>{serviceDetails.service_name}</h3>

                    <h2 className='flex gap-2 text-lg text-gray-500'>
                        <MapPin />
                        {geocodedAddress || 'Location not available'}
                    </h2>
                    <h2 className='flex gap-2 text-lg text-gray-500'>
                        <Phone />
                        {providerDetails.provider_phone_number || 'Phone Number not available'}
                    </h2>
                    <h2 className='flex gap-2 text-lg text-gray-500'>
                        <Mail />
                        {providerDetails.provider_email || 'Email not available'}
                    </h2>
                </div>
                <div className='flex flex-col gap-5 items-end'>
                    <Button><Share /></Button>
                    <h2 className='flex gap-2 text-primary'>
                        <User />
                        {providerDetails.provider_name || 'Name not available'}
                    </h2>
                    <h2 className='flex gap-2 text-gray-500'><Clock />Available 8:00 AM to 7:00 PM</h2>
                </div>
            </div>
            
        </div>
    );
}

export default UserProfile;
