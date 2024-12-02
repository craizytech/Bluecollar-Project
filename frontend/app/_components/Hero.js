"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import useGeolocation from '@/app/hooks/useGeolocation';
import counties from '../data/counties';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServiceProviders } from '../store/slices/serviceProviders';
import { setCounty, setLocation } from '../store/slices/location';
import Map from '../_components/MyMap';
import List from './List';

function Hero({ listData, setListData }) {
    const dispatch = useDispatch();
    const { location, error } = useGeolocation();
    const county = useSelector(state => state.location.county);
    const serviceProviders = useSelector(state => state.serviceProviders.providers);
    const providersStatus = useSelector(state => state.serviceProviders.status);
    const userLocation = useSelector(state => state.location.location);
    const address = useSelector(state => state.location.address);
    const [searchResults, setSearchResults] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCounties, setFilteredCounties] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [suggestedAddresses, setSuggestedAddresses] = useState([]);
    const [inputAddress, setInputAddress] = useState(address);
    const [loading, setLoading] = useState(false); 

    useEffect(() => {
        // Check if location was updated and set the county if needed
        if (location.latitude && location.longitude) {
            console.log('User location updated:', location);
            // You can optionally use reverse geocoding to get county name
            dispatch(setLocation(location)); // Setting the latitude and longitude
        }
    }, [location, dispatch]);

    useEffect(() => {
        // Initialize inputAddress with the address from Redux when component mounts
        setInputAddress(address);
    }, [address]);

    useEffect(() => {
        if (providersStatus === 'idle') {
            dispatch(fetchServiceProviders());
        }
    }, [dispatch, providersStatus, userLocation]);

    useEffect(() => {
        console.log('Service Providers Updated:', serviceProviders);
    }, [serviceProviders]);

    const handleSearch = async () => {
        if (!searchTerm || !inputAddress) {
            setErrorMsg('Please enter both search term and location.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`http://localhost:5000/api/services/search?location=${encodeURIComponent(inputAddress)}&term=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.services.length === 0) {
                    setFilteredProviders(data.services);
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
        } finally {
            setLoading(false);
        }
    };

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
    };

    const providerData = serviceProviders.map(provider => {
        const [lat, lng] = provider.provider.user_location.split(',').map(coord => parseFloat(coord));
        return {
            lat,
            lng,
            name: provider.provider.user_name,
            address: provider.provider.user_address,
            providerId: provider.providerId,
            categoryId: provider.categoryId,
            serviceId: provider.serviceId,
            serviceDescription: provider.serviceDescription,
            serviceName: provider.serviceName
        };
    });

    return (
        <div className="flex  items-start w-full px-4 py-8 gap-8">
            {/* Left Section: Search and Results */}
            <div className="flex flex-col w-full md:w-1/2 mb-8">
                <h2 className="font-bold text-3xl text-center pb-7">
                    Find Home <span className="text-primary">Service/Repair</span> Near You
                </h2>
                <h2 className="text-lg text-gray-400 mb-5 text-center">
                    Explore the best home service & repair near you
                </h2>
                <div className="flex gap-4 items-center justify-center mb-5">
                    <Input
                        placeholder='Search'
                        className="rounded-lg w-full max-w-md h-20"
                        value={searchTerm || ''}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="relative w-full max-w-md">
                        <Input
                            placeholder='Enter location'
                            className="rounded-lg w-full h-20"
                            value={inputAddress || ''}
                            onChange={handleLocationChange}
                        />
                        {showDropdown && (
                            <ul className="absolute z-10 bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto shadow-lg rounded-md">
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
                    <Button onClick={handleSearch} className="flex-shrink-0">
                        <Search />
                    </Button>
                </div>
                {loading && (
                    <div className="text-center">
                        <p className="text-gray-500">Searching for services...</p>
                    </div>
                )}
                {errorMsg && <p className="text-red-500 mb-5">{errorMsg}</p>}
                {searchResults.length > 0 && (
                    <div className="mt-5 w-full">
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

            {/* Right Section: Map */}
            <div className="w-full">
                <Map 
                    setListData={setListData}
                    userPosition={location} 
                    serviceProviders={providerData}
                />
                {/* List component to be shown below the map */}
                <div className="mt-8 w-full">
                    <List data={listData}/>
                </div>
            </div>
        </div>
    );
}

export default Hero;
