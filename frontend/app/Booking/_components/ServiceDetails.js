"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';

function ServiceDetails({ serviceId }) {
    const [serviceDetails, setServiceDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!serviceId) return;

        async function fetchServiceDetails() {
            try {
                const response = await fetch(`http://localhost:8080/api/services/${serviceId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch service details');
                }
                const data = await response.json();
                setServiceDetails(data);
            } catch (error) {
                console.error('Error fetching service details:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchServiceDetails();
    }, [serviceId]);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={index < rating ? 'text-yellow-500' : 'text-gray-300'}>
                ★
            </span>
        ));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!serviceDetails) {
        return <div>No service details available</div>;
    }

    return (
        <div>
            <h2 className='font-bold text-[25px]'>Description</h2>
            <p className='mt-4 text-lg text-gray-600'>{serviceDetails.service_description}</p>

            <h2 className='font-bold text-[25px] mt-8'>Gallery</h2>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5'>
                <Image
                    src='/person3.jpg'
                    alt='image'
                    width={700}
                    height={200}
                    className='rounded-lg'
                />
            </div>

            <h2 className='font-bold text-[25px] mt-8'>Reviews</h2>
            {serviceDetails.reviews.length > 0 ? (
                serviceDetails.reviews.map((review, index) => (
                    <div key={index} className='mt-4'>
                        <p className='text-lg text-gray-400'>{review.date_of_creation}</p>
                        <p className='text-lg text-gray-600'><strong>{review.client_name}:</strong> {review.comment}</p>
                        <p className='text-lg text-gray-600'>
                            <strong>Rating:</strong> {renderStars(review.rating)}
                        </p>
                    </div>
                ))
            ) : (
                <p>No reviews available</p>
            )}
        </div>
    );
}

export default ServiceDetails;
