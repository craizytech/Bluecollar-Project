import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import useGeolocation from '@/app/hooks/useGeolocation';
// import counties from '../data/counties';
// import Link from 'next/link';

const mapContainerStyle = {
    width: "100vw",
    height: "60vh",
};
const center = {
    lat: -1.286389,  // Set default center (e.g., Nairobi, Kenya)
    lng: 36.817223,
};

function Hero() {
    const { county, error } = useGeolocation();
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');
    const [filteredCounties, setFilteredCounties] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        if (county && !error) {
            setLocation(county);
        }
    }, [county, error]);

    const handleSearch = async () => {
        if (!searchTerm || !location) return;

        try {
            const response = await fetch(`http://localhost:5000/api/services/search?location=${encodeURIComponent(location)}&term=${encodeURIComponent(searchTerm)}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.services);
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    if (loadError) return <p>Error loading map</p>;
    if (!isLoaded) return <p>Loading map...</p>;

    return (
        <div className="flex items-center flex-col justify-center px-4">
            <h2 className="font-bold text-3xl text-center pt-14 pb-7">
                Find Home <span className="text-primary">Service/Repair</span> Near You
            </h2>
            <h2 className="text-lg text-gray-400 mb-5">Explore the best home service & repair near you</h2>

            <div className="flex gap-4 items-center">
                <Input placeholder='Search' className="rounded-lg w-full max-w-md" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="relative">
                    <Input placeholder='Enter location' className="rounded-lg w-full max-w-md" value={location} onChange={(e) => setLocation(e.target.value)} />
                    {showDropdown && (
                        <ul className="absolute z-10 bg-white border mt-1 w-full max-h-60 overflow-y-auto shadow-lg rounded-md">
                            {filteredCounties.map((county, index) => (
                                <li key={index} onClick={() => setLocation(county)} className="p-2 cursor-pointer hover:bg-gray-200">
                                    {county}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <Button onClick={handleSearch} className="flex-shrink-0">Search</Button>
            </div>

            <div className="mt-5 w-80 max-w-2xl">
                <GoogleMap className="w-auto" mapContainerStyle={mapContainerStyle} zoom={10} center={center}>
                    {searchResults.map((service) => (
                        <Marker
                            key={service.service_id}
                            position={{ lat: parseFloat(service.latitude), lng: parseFloat(service.longitude) }}
                            title={service.service_name}
                        />
                    ))}
                </GoogleMap>
            </div>
        </div>
    );
}

export default Hero;
