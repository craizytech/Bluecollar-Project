import { useState, useEffect } from 'react';

const useGeolocation = () => {
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [county, setCounty] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGeolocation = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ latitude, longitude });

                        console.log('Geolocation - Latitude:', latitude);
                        console.log('Geolocation - Longitude:', longitude);

                        try {
                            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDeOZ6drkVM9-7UXiAIoLv6cVslMcNqUfM`);
                            const data = await response.json();
                            console.log('Geocoding API Response:', data);

                            if (data.results && data.results.length > 0) { 
                                const addressComponents = data.results[0].address_components;
                                const countyComponent = addressComponents.find(component => 
                                    component.types.includes('administrative_area_level_2')
                                );
                                if (countyComponent) {
                                    setCounty(countyComponent.long_name + ', Kenya');
                                } else {
                                    setCounty('County not found');
                                }
                            } else {
                                setCounty('No results found');
                            }
                        } catch (error) {
                            console.error('Geocoding API Error:', error);
                            setError('Error fetching location data');
                        }
                    },
                    (error) => {
                        console.error('Geolocation Error:', error);
                        setError('Error getting geolocation');
                    }
                );
            } else {
                setError('Geolocation is not supported by this browser.');
            }
        };

        fetchGeolocation();
    }, []);

    return { location, county, error };
};

export default useGeolocation;
