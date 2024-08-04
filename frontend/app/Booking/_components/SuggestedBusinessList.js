"use client";
import React, { useEffect, useState } from 'react';
import BookingSection from './BookingSection';
import { Button } from '@/components/ui/button';
import { NotebookPen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCategory } from '@/app/context/CategoryContext';

function SuggestedBusinessList({ serviceId }) {
  const [similarBusinesses, setSimilarBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categoryId } = useCategory();

  useEffect(() => {
    if (!serviceId || !categoryId) {
      setLoading(false);
      console.log('ServiceId or CategoryId not provided.');
      return;
    }

    async function fetchSimilarBusinesses() {
      try {
        const response = await fetch(`http://localhost:5000/api/services/category/${categoryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch similar businesses');
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          // Filter out the current service
          const filteredBusinesses = data.filter((business) => business.service_id !== parseInt(serviceId, 10));

          // Fetch provider details for each similar business
          const businessesWithProviderDetails = await Promise.all(
            filteredBusinesses.map(async (business) => {
              const providerResponse = await fetch(`http://localhost:5000/api/services/${business.service_id}`);
              if (!providerResponse.ok) {
                throw new Error('Failed to fetch provider details');
              }
              const providerDetails = await providerResponse.json();
              return { ...business, providerDetails };
            })
          );
          setSimilarBusinesses(businessesWithProviderDetails);
        } else {
          setSimilarBusinesses([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching similar businesses:', error);
        setLoading(false);
      }
    }

    fetchSimilarBusinesses();
  }, [serviceId, categoryId]);

  const handleBookingSuccess = () => {
    console.log('Booking was successful!');
  };

  return (
    <div className='md:pl-10'>
      <BookingSection serviceId={serviceId} onBookingSuccess={handleBookingSuccess}>
        <Button className="flex gap-2 w-full">
          <NotebookPen />
          Book Appointment
        </Button>
      </BookingSection>
      <div className='hidden md:block'>
        <h2 className='font-bold text-lg mt-3 mb-3'>Similar Businesses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : similarBusinesses.length > 0 ? (
          similarBusinesses.map((business) => (
            <Link
              key={business.service_id}
              href={`/Booking?serviceId=${business.service_id}&categoryId=${categoryId}`}
              className='flex gap-2 mb-4 hover:border rounded-lg p-2 cursor-pointer hover:shadow-md border-primary'
            >
              <Image
                src={business.image || '/person3.jpg'}
                alt='Business Image'
                width={80}
                height={80}
                className='rounded-lg object-cover'
              />
              <div>
                <h2 className='font-bold'>{business.service_name}</h2>
                <h2 className='text-primary'>{business.providerDetails.provider_name}</h2> {/* Display provider's name */}
                <h2 className='text-gray-400'>{business.providerDetails.provider_location}</h2> {/* Display provider's location */}
              </div>
            </Link>
          ))
        ) : (
          <p>No similar businesses available</p>
        )}
      </div>
    </div>
  );
}

export default SuggestedBusinessList;
