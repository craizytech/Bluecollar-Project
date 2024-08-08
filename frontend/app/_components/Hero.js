"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import useGeolocation from '@/app/hooks/useGeolocation';
import counties from '../data/counties';
import Link from 'next/link';

function Hero() {
    const { county, error } = useGeolocation();
    const [searchResults, setSearchResults] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');
    const [filteredCounties, setFilteredCounties] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (county && !error) {
            setLocation(county);
        }
    }, [county, error]);

    const handleSearch = async () => {
        if (!searchTerm || !location) {
            setErrorMsg('Please enter both search term and location.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/services/search?location=${encodeURIComponent(location)}&term=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.services.length === 0) {
                    setErrorMsg('No services found for your search. Please check the term and location.');
                    setSearchResults([]);
                } else {
                    setSearchResults(data.services);
                    setErrorMsg('');
                }
            } else {
                setErrorMsg('Failed to fetch search results.');
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            setErrorMsg('Error fetching search results.');
        }
    };

    const handleLocationChange = (e) => {
        const query = e.target.value;
        setLocation(query);

        if (query) {
            const filtered = counties.filter(county =>
                county.toLowerCase().startsWith(query.toLowerCase())
            );
            setFilteredCounties(filtered);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleSelectCounty = (selectedCounty) => {
        setLocation(selectedCounty);
        setShowDropdown(false);
    };

    return (
        <div className="flex items-center flex-col justify-center px-4">
            <h2 className="font-bold text-3xl text-center pt-14 pb-7">
                Find Home <span className="text-primary">Service/Repair</span> Near You
            </h2>
            <h2 className="text-lg text-gray-400 mb-5">Explore the best home service & repair near you</h2>
            <div className="flex gap-4 items-center">
                <Input
                    placeholder='Search'
                    className="rounded-lg w-full max-w-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="relative">
                    <Input
                        placeholder='Enter location'
                        className="rounded-lg w-full max-w-md"
                        value={location}
                        onChange={handleLocationChange}
                    />
                    {showDropdown && (
                        <ul className="absolute z-10 bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto shadow-lg rounded-md">
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
                <Button onClick={handleSearch} className="flex-shrink-0">
                    <Search />
                </Button>
            </div>
            {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
            {searchResults.length > 0 && (
                <div className="mt-5 w-full max-w-xl">
                    <h3 className="font-bold text-lg mb-4">Search Results:</h3>
                    <ul className="space-y-4">
                        {searchResults.map(service => (
                            <Link 
                                key={service.service_id} 
                                href={`/Booking?serviceId=${service.service_id}`}
                                className="block border border-gray-300 rounded-lg shadow-md p-2 hover:bg-gray-50 transition"
                            >
                                <div className="font-semibold text-sm">{service.service_name}</div>
                                <p className="text-gray-600">{service.service_description}</p>
                                <p className="text-gray-500">Location: {service.provider_location}</p>
                            </Link>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Hero;
