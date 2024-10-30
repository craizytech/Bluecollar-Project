"use client";
import React, { useEffect, useState } from 'react';
import { useCategory } from '@/app/context/CategoryContext';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import Spinner from '@/app/_components/spinner/Spinner';

function BusinessByCategory({ categoryId: initialCategoryId }) {
    const { setCategoryId } = useCategory();
    const [services, setServices] = useState([]);
    const [token, setToken] = useState('');
    const [categoryName, setCategoryName] = useState(``);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialCategoryId) {
            setCategoryId(initialCategoryId);
        }
    }, [initialCategoryId, setCategoryId]);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
            setToken(storedToken);
        }

        async function fetchServices() {
            setLoading(true)
            try {
                console.log(`Fetching services for category ID: ${initialCategoryId}`);
                const url = initialCategoryId
                    ? `http://localhost:5000/api/services/category/${initialCategoryId}`
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
                console.log('Fetched Services Data:', servicesData);

                if (initialCategoryId) {
                    // Fetch details for each service based on the service_id
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
                        console.log(`Details for Service ID ${service.service_id}:`, detailsData);

                        return {
                            ...service,
                            details: detailsData
                        };
                    }));

                    console.log('Services with Details:', servicesWithDetails);
                    setServices(servicesWithDetails);
                    // Set the category name for the heading
                    if (servicesWithDetails.length > 0) {
                        setCategoryName(servicesWithDetails[0].details.category_name);
                    }
                } else {
                    // No categoryId, just set the services as they are
                    setServices(servicesData);
                }
            } catch (error) {
                console.error('Error fetching services or details:', error);
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchServices();
        }
    }, [token, initialCategoryId]);

    const handleBookNowClick = (serviceId, categoryId, providerId) => {
        console.log('Clicked Book Now for service ID:', serviceId, 'with category ID:', categoryId, 'and provider ID:', providerId);
    };

    return (
        <div className="mt-5 mb-10">
            <h2 className="font-bold text-[22px]">{categoryName}</h2>
            {loading ? (
                <div className="flex justify-center items-center">
                    <Spinner />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5 shadow-sm">
                {services.map(service => (
                    <div key={service.service_id} className="shadow-md rounded-lg hover:shadow-lg cursor-pointer hover:shadow-primary hover:scale-105 transition-all ease-in-out">
                        <Image
                            src={`/person${service.details?.provider_id % 3 + 1}.jpg`}
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

export default BusinessByCategory;
