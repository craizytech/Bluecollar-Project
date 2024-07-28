"use client";
import { Button } from '@/components/ui/button';
import { NotebookPen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import BookingSection from './BookingSection';

function SuggestedBusinessList({ serviceId }) {
  const [similarBusinesses, setSimilarBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [providerId, setProviderId] = useState(null);

  useEffect(() => {
    if (!serviceId) {
      setLoading(false);
      console.log('ServiceId not provided.');
      return;
    }

    async function fetchSimilarBusinesses() {
      try {
        const response = await fetch(`http://localhost:8080/api/services/${serviceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch similar businesses');
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          setSimilarBusinesses(data);
        } else if (data && typeof data === 'object' && data.similarBusinesses) {
          console.log('Fetched data contains similarBusinesses key:', data.similarBusinesses);
          setSimilarBusinesses(data.similarBusinesses);
          setProviderId(data.provider_id); // Assuming provider_id is part of the response
        } else {
          console.error('Unexpected data structure:', data);
          setSimilarBusinesses([]);
        }

        setLoading(false);
        console.log('Similar businesses fetched successfully:', data);
      } catch (error) {
        console.error('Error fetching similar businesses:', error);
        setLoading(false);
      }
    }

    fetchSimilarBusinesses();
  }, [serviceId]);

  useEffect(() => {
    console.log('Current state:');
    console.log('serviceId:', serviceId);
    console.log('similarBusinesses:', similarBusinesses);
    console.log('loading:', loading);
  }, [serviceId, similarBusinesses, loading]);

  const filteredBusinesses = Array.isArray(similarBusinesses)
    ? similarBusinesses.filter((business) => business.service_id !== serviceId)
    : [];

  return (
    <div className='md:pl-10'>
      <BookingSection serviceId={serviceId} providerId={providerId}>
        <Button className="flex gap-2 w-full">
          <NotebookPen />
          Book Appointment
        </Button>
      </BookingSection>
      <div className='hidden md:block'>
        <h2 className='font-bold text-lg mt-3 mb-3'>Similar Businesses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : filteredBusinesses.length > 0 ? (
          filteredBusinesses.map((business) => (
            <Link
              key={business.service_id}
              href={`/services/${business.service_id}`}
              className='flex gap-2 mb-4 hover:border rounded-lg p-2 cursor-pointer hover:shadow-md border-primary'
            >
              <Image
                src={business.image || '/business.jpg'}
                alt='Business Image'
                width={80}
                height={80}
                className='rounded-lg object-cover'
              />
              <div>
                <h2 className='font-bold'>{business.service_name}</h2>
                <h2 className='text-primary'>{business.provider_name}</h2>
                <h2 className='text-gray-400'>{business.service_description}</h2>
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
