import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import useGeolocation from '@/app/hooks/useGoelocation';

function Hero() {
    const { location, error } = useGeolocation();
    const [searchResults, setSearchResults] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = async () => {
      
    };
    
  
  
  

    return (
        <div className="flex items-center flex-col justify-center">
            <h2 className="font-bold text-[46px] text-center pt-14 pb-7">
                Find Home <span className="text-primary">Service/Repair</span> Near You
            </h2>
            <h2 className="text-xl text-gray-400">Explore Best Home Service & Repair near you</h2>
            <div className="flex gap-4 items-center mt-5">
                <Input
                    placeholder='Search'
                    className="rounded-lg md:w-[350px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={handleSearch} className="">
                    <Search />
                </Button>
            </div>
            {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
            {searchResults.length > 0 && (
                <div className="mt-5">
                    <h3 className="font-bold text-xl">Search Results:</h3>
                    <ul>
                        {searchResults.map(service => (
                            <li key={service.service_id} className="border p-4 mb-2">
                                <h4 className="font-semibold">{service.service_name}</h4>
                                <p>{service.service_description}</p>
                                <p>Provider: {service.provider_name}</p>
                                <p>Location: {service.provider_location}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Hero;
