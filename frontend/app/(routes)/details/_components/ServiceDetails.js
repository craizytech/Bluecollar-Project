"use client";
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

function ServiceDetails({ categoryId }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const SERVICES_URL = `http://localhost:5000/api/services/category/${categoryId}`;
        const response = await fetch(SERVICES_URL);
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        } else {
          console.error('Failed to fetch services:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }

    fetchServices();
  }, [categoryId]);

  return (
    <div>
      <h2 className='font-bold text-[25px]'>Description</h2>
      {services.length > 0 ? (
        services.map((service, index) => (
          <div key={index}>
            <p className='mt-4 text-lg text-gray-600'>{service.service_description}</p>
          </div>
        ))
      ) : (
        <p>No services available</p>
      )}

      <h2 className='font-bold text-[25px] mt-8'>Gallery</h2>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
      gap-5 mt-5'>
        <Image src={'/business.jpg'}
            alt="image"
            width={700}
            height={200}
            className='rounded-lg'
            />
      </div>
    </div>
  );
}

export default ServiceDetails;
