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
                const response = await fetch(`http://localhost:5000/api/services/${serviceId}`);
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

            {/* <h2 className='font-bold text-[25px] mt-8'>Gallery</h2>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5'>
                <Image
                    src='/person3.jpg'
                    alt='image'
                    width={700}
                    height={200}
                    className='rounded-lg'
                />
            </div> */}

            <h2 className='font-bold text-2xl mt-16 mb-4 text-gray-800'>Reviews</h2>
                {serviceDetails.reviews.length > 0 ? (
                serviceDetails.reviews.map((review, index) => (
                <div key={index} className='bg-white shadow-lg rounded-lg p-4 mt-4 border border-gray-200'>
                    <p className='text-sm text-gray-500'>{review.date_of_creation}</p>
                    <div className='mt-2'>
                        <p className='text-lg text-gray-800 font-semibold'>
                            <span className='text-primary'>{review.client_name}</span>:
                        </p>
                        <p className='text-lg text-gray-700 mt-1'>{review.comment}</p>
                        <p className='text-lg text-gray-700 mt-2'>
                            <strong className='text-gray-800'>Rating:</strong> {renderStars(review.rating)}
                        </p>
                    </div>
                </div>
            ))
            ) : (
                <p className='text-gray-600 mt-4'>No reviews available.</p>
            )}

        </div>
    );
}

export default ServiceDetails;
