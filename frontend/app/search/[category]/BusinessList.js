"use client";
import Spinner from '@/app/_components/spinner/Spinner';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

function BusinessList({ title, categoryId }) {
    const [services, setServices] = useState([]);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
            setToken(storedToken);
        }

        async function fetchServices() {
            try {
                setLoading(true)
                const url = categoryId
                    ? `http://localhost:5000/api/services/category/${categoryId}`
                    : 'http://localhost:5000/api/services/all';
        
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                    },
                });
        
                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }
        
                const servicesData = await response.json();
                console.log('Services Data:', servicesData);
        
                // Check if servicesData is an array or object
                if (Array.isArray(servicesData)) {
                    if (!categoryId) {
                        // Fetch details for each service
                        const servicesWithDetails = await Promise.all(servicesData.map(async (service) => {
                            const detailsResponse = await fetch(`http://localhost:5000/api/services/${service.service_id}`, {
                                headers: {
                                    'Authorization': `Bearer ${storedToken}`,
                                },
                            });
        
        
                            if (!detailsResponse.ok) {
                                throw new Error('Failed to fetch service details');
                            }
        
                            const detailsData = await detailsResponse.json();
        
                            return {
                                ...service,
                                details: {
                                    ...detailsData,
                                    category_id: service.category_id,
                                    provider_id: service.provider_id,
                                }
                            };
                        }));
        
                        console.log('Services with Details:', servicesWithDetails);
                        setServices(servicesWithDetails);
                    } else {
                        // If categoryId is present, we only need the services
                        setServices(servicesData);
                    }
                } else {
                    console.error('Expected servicesData to be an array, but got:', servicesData);
                }
            } catch (error) {
                console.error('Error fetching services or details:', error);
            } finally {
                setLoading(false);
            }
        }
        

        if (token) {
            fetchServices();
        }
    }, [token, categoryId]);

    const handleBookNowClick = (serviceId, categoryId, providerId) => {
        console.log('Clicked Book Now for service ID:', serviceId, 'with category ID:', categoryId, 'and provider ID:', providerId);
    };

    return (
        <div className="mt-5 mb-10">
            <h2 className="font-bold text-[22px]">{title}</h2>

            {loading ? (
                <div className="flex justify-center items-center">
                    <Spinner />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5 shadow-sm">
                {services.map(service => (
                    <div key={service.service_id} className="shadow-md rounded-lg hover:shadow-lg cursor-pointer hover:shadow-primary hover:scale-105 transition-all ease-in-out">
                        <Image
                            src={`/person${service.provider_id % 3 + 1}.jpg`}
                            alt=""
                            width={500}
                            height={200}
                            className="h-[150px] md:h-[200px] object-cover rounded-lg"
                        />
                        <div className="flex flex-col items-baseline p-3 gap-1">
                            <h2 className="p-1 bg-blue-100 text-primary rounded-full px-2 text-[12px]">{service.details?.category_name || 'Category'}</h2>
                            <h2 className="font-bold text-lg">{service.details?.service_name || service.service_name}</h2>
                            <h2 className="text-primary">{service.details?.provider_name || 'Provider'}</h2>
                            <h2 className="text-gray-500 text-sm">{service.details?.provider_location || 'Location'}</h2>
                            <Link href={`/Booking?serviceId=${service.service_id}&categoryId=${service.details?.category_id || service.category_id}`}>
                                <Button onClick={() => handleBookNowClick(service.service_id, service.details?.category_id || service.category_id, service.details?.provider_id || service.provider_id)} className="rounded-lg mt-3">View Details</Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            )}
            
        </div>
    );
}

export default BusinessList;
