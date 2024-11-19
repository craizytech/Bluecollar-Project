import { useEffect, useState } from 'react';
import counties from '../data/counties';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation, setCounty, setError, setAddress } from '../store/slices/location';

const useGeolocation = () => {
    const dispatch = useDispatch();
    const location = useSelector(state => state.location.location);
    const error = useSelector(state => state.location.error);
    const address = useSelector(state => state.location.address);

    useEffect(() => {
        const fetchGeolocation = async () => {
            if (!navigator.geolocation) {
                dispatch(setError('Geolocation is not supported by this browser.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    dispatch(setLocation({ latitude, longitude }));
                    

                    try {
                        const response = await fetch(
                            `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=672958dc30760969524851ktj2e0ae5`
                            // `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBz42oL3pogGi6iAe9VvXfy1nX6wVN9a9g`
                        );
                        const data = await response.json();
                        console.log('Geocoding API Response:', data);

                        if (data && data.address) {
                            const fullAddress = data.address;
                            // You can also use other specific parts of the address like 'road', 'city', 'state', etc.
                            const formattedAddress = `${fullAddress.road || ''}, ${fullAddress.city || ''}, ${fullAddress.state || ''}`;
                            console.log('Geocoded Address:', formattedAddress);
                            dispatch(setAddress(formattedAddress));  // Save the address
                        } else {
                            dispatch(setAddress('No address found'));
                        }
                    } catch (error) {
                        console.error('Geocoding API Error:', error);
                        dispatch(setError('Error fetching location data'));
                    }
                },
                (error) => {
                    console.error('Geolocation Error:', error);
                    dispatch(setError('Error getting geolocation'));
                }
            );
        };

        fetchGeolocation();
    }, [dispatch]);

    return { location, error };
};

export default useGeolocation;
