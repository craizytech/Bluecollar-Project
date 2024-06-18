"use client";

import { Button } from '@/components/ui/button';
import { Clock, Mail, MapPin, Phone, Share, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
// import ServiceDetails from './ServiceDetails';
import { isAuthenticated, handleLogin } from './auth';

function UserProfile() {
  const [userDetails, setUserDetails] = useState({});
  const [categoryName, setCategoryName] = useState('');
  const [services, setServiceNames] = useState([]);
  const [loading, setLoading] = useState(true);

  const USER_PROFILE_URL = 'http://localhost:5000/api/users/profile';
  const SERVICES_URL = 'http://localhost:5000/api/services/';

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Calling handleLogin...');
        const loginSuccess = await handleLogin();
        console.log('Called handleLogin, success:', loginSuccess);

        if (!loginSuccess || !isAuthenticated()) {
          console.error('User not authenticated');
          return;
        }

        const token = localStorage.getItem('accessToken');
        console.log('Fetched token from localStorage:', token);

        if (!token) {
          console.error('No token found in localStorage');
          return;
        }

        // Fetch user details
        const userResponse = await fetch(USER_PROFILE_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        console.log('User response status:', userResponse.status);
        if (userResponse.status === 401) {
          console.error('Unauthorized request, token might be invalid or expired');
          return;
        }

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User data:', userData);

          if (!userData) {
            console.error('User data is undefined or empty');
            return;
          }

          setUserDetails(userData);

          // Fetch services by user_id
          const servicesResponse = await fetch(`${SERVICES_URL}category/${userData.user_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json();
            console.log('Services data:', servicesData);

            if (servicesData && servicesData.length > 0) {
              setServiceNames(servicesData);

              // Assuming servicesData contains a common category_name for all services
              if (servicesData[0].category_name) {
                setCategoryName(servicesData[0].category_name);
              }
            } else {
              console.error('Services data is empty');
            }
          } else {
            console.error('Failed to fetch services by user:', servicesResponse.statusText);
          }
        } else {
          console.error('Failed to fetch user details:', userResponse.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='md:flex gap-4 items-center'>
      {userDetails && userDetails.user_profile_picture ? (
        <img
          src={userDetails.user_profile_picture}
          alt={userDetails.user_name || 'User profile picture'}
          width={150}
          height={200}
          className='rounded-full h-[150px] object-cover'
        />
      ) : (
        <div className='rounded-full h-[150px] w-[150px] bg-gray-200'></div>
      )}

      <div className='flex justify-between items-center w-full'>
        <div className='flex flex-col mt-4 md:mt-0 items-baseline gap-3'>
          <h2 className='text-primary p-1 px-3 text-lg bg-purple-100 rounded-full'>
            {categoryName || 'Not available'}
          </h2>
          {services.length > 0 ? (
            services.map((service, index) => (
              <h3 key={index} className='text-[20px] font-bold'>Service Offered: {service.service_name}</h3>
            ))
          ) : (
            <p>No services available</p>
          )}

          <h2 className='flex gap-2 text-lg text-gray-500'>
            <MapPin />
            {userDetails.user_location || 'Location not available'}
          </h2>
          <h2 className='flex gap-2 text-lg text-gray-500'>
            <Phone />
            {userDetails.user_phone_number || 'Phone Number not available'}
          </h2>
          <h2 className='flex gap-2 text-lg text-gray-500'>
            <Mail />
            {userDetails.user_email || 'Email not available'}
          </h2>
        </div>
        <div className='flex flex-col gap-5 items-end'>
          <Button><Share /></Button>
          <h2 className='flex gap-2 text-primary'>
            <User />
            {userDetails.user_name || 'Name not available'}
          </h2>
          <h2 className='flex gap-2 text-gray-500'><Clock />Available 8:00 AM to 7:00 PM</h2>
        </div>
      </div>
      {/* <ServiceDetails categoryId={userDetails.category_id} /> */}
    </div>
  );
}

export default UserProfile;
