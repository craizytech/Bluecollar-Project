"use client";
import { Button } from '@/components/ui/button';
import { Clock, Mail, MapPin, Phone, Share, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [userDetails, setUserDetails] = useState({});
  const [categoryName, setCategoryName] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user details
        const userResponse = await fetch('/api/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Assuming you store JWT token in localStorage
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserDetails(userData.user);
        } else {
          console.error('Failed to fetch user details:', userResponse.statusText);
        }

        // Fetch services by category
        const servicesResponse = await fetch(`/api/services/category/${categoryId}`, {
          method: 'GET'
        });

        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData);
        } else {
          console.error('Failed to fetch services by category:', servicesResponse.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Function to fetch category details for a specific service
  async function fetchCategoryDetails(categoryId) {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'GET'
      });

      if (response.ok) {
        const categoryData = await response.json();
        setCategoryName(categoryData.category_name);
        return categoryData.category_name;
      } else {
        console.error('Failed to fetch category details:', response.statusText);
        return 'Category Not Found';
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
      setCategoryName('Category Not Found');
      return 'Category Not Found';
    }
  }

  return (
    <div className='md:flex gap-4 items-center pt-10 ml-36'>
      <h1>User Profile</h1>
      <img src={userDetails.user_profile_picture} alt={userDetails.user_name} 
      width={150} height={200} 
      className='rounded-full h-[150px] object-cover'/>

      <div className='flex justify-between items-center w-full'>
        <div className='flex flex-col mt-4 md:mt-0 items-baseline gap-3'>
            <h2 className='text-primary p-1 px-3 text-lg
            bg-purple-100 rounded-full'>Category: {categoryName}</h2>
            <h2 className='flex gap-2 text-lg text-gray-400'><MapPin/>{userDetails.user_location}</h2>
            <h2 className='flex gap-2 text-lg text-gray-400'><Phone/>{userDetails.user_phone_number}</h2>
            <h2 className='flex gap-2 text-lg text-gray-500'><Mail />Email {userDetails.user_email}</h2>
            {services.map(service => (
            <div key={service.service_id}>
            {service.user_id === userDetails.user_id && (
                <div>
                    <h2 className='text-[40px] font-bold'>Service Offered: {service.service_name}</h2>
                    <h2 className='font-bold text-[25px] mt-16'>Description</h2>
                    <p className='text-sm mt-4 text-gray-500 col-span-4 md:col-span-3'>{service.service_description}</p>
                </div>
            )}
            </div>
        ))}
        </div>
        <div className='flex flex-col gap-5 items-end mr-36'>
            <Button><Share/></Button>
            <h2 className='flex gap-2 text-primary'><User/>Name {userDetails.user_name}</h2>
            <h2 className='flex gap-2 text-gray-500'><Clock/>Available 8:00 AM to 7:00 PM</h2>
        </div>
      </div>

    </div>
  );
}

export default UserProfile;
