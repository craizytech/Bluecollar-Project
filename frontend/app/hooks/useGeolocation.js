import { useState, useEffect } from 'react';
import counties from '../data/counties';  // Import your counties list

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
                                let foundCounty = 'County not found';
                                let potentialCounty = '';

                                // Iterate through the results to find a suitable match
                                for (const result of data.results) {
                                    const addressComponents = result.address_components;
                                    // Check for a component that includes 'County'
                                    const countyComponent = addressComponents.find(component => 
                                        component.types.includes('administrative_area_level_2') || 
                                        component.long_name.toLowerCase().includes('county')
                                    );

                                    if (countyComponent) {
                                        // Check if the county name or a close match exists in your list
                                        potentialCounty = countyComponent.long_name.replace('County', '').trim() + ', Kenya';
                                        if (counties.includes(potentialCounty)) {
                                            foundCounty = potentialCounty;
                                            break;  // Stop searching once a match is found
                                        }
                                    }
                                }

                                // Fallback to 'County not found' if no suitable match is found
                                if (foundCounty === 'County not found') {
                                    // Check for explicit 'County' results
                                    const countyResult = data.results.find(result =>
                                        result.formatted_address.toLowerCase().includes('county')
                                    );
                                    if (countyResult) {
                                        const addressComponents = countyResult.address_components;
                                        const countyComponent = addressComponents.find(component => 
                                            component.types.includes('administrative_area_level_2')
                                        );
                                        if (countyComponent) {
                                            potentialCounty = countyComponent.long_name.replace('County', '').trim() + ', Kenya';
                                            if (counties.includes(potentialCounty)) {
                                                foundCounty = potentialCounty;
                                            }
                                        }
                                    }
                                }

                                setCounty(foundCounty);
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
