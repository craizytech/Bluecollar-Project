"use client";
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CategoryContext } from '@/app/context/CategoryContext';

function ServiceProvider() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const context = useContext(CategoryContext);
  const [error, setError] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');

  if (!context) {
    console.error('CategoryContext is not available');
    return null;
  }

  const { categoryId, setCategoryId } = context;
  const [selectedService, setSelectedService] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch user email and ID
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setEmail(response.data.user_email);
        setUserId(response.data.user_id);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories/all');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchUserData();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch services based on selected category
    const fetchServices = async () => {
      if (categoryId) {
        try {
          console.log('Fetching services for categoryId:', categoryId);
          const response = await axios.get(`http://localhost:5000/api/services/category/${categoryId}`);
          setServices(response.data);
        } catch (error) {
          console.error('Error fetching services:', error);
        }
      }
    };

    fetchServices();
  }, [categoryId]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedService || !categoryId) {
      setError('Please select both a category and a service.');
      return;
    }

    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.post(
        'http://localhost:5000/api/services/apply_service',
        {
          email: email,
          service_category_id: categoryId,
          service_id: selectedService,
          service_duration: serviceDuration
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        setMessage('Your application has been submitted successfully.Wait for approval by admin');
      }
    } catch (error) {
      console.error('Error applying for service:', error);
      setError('Failed to submit your application. Please try again.');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-5 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Application to be a Service Provider</h2>
      <form onSubmit={handleApply}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 border rounded-md"
            value={email}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="category">Service Category</label>
          <select
            id="category"
            name="category"
            className="w-full px-3 py-2 border rounded-md"
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="service">Service</label>
          <select
            id="service"
            name="service"
            className="w-full px-3 py-2 border rounded-md"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            disabled={!categoryId}
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.service_id} value={service.service_id}>
                {service.service_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="duration">Service Duration</label>
          <select
            id="duration"
            name="duration"
            className="w-full px-3 py-2 border rounded-md"
            value={serviceDuration}
            onChange={(e) => setServiceDuration(Number(e.target.value))}
          >
            <option value="">Select duration of service</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
            <option value={240}>4 hours</option>
            <option value={270}>Half day</option>
            <option value={540}>Full day</option>
          </select>
        </div>
        <div className="mb-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Apply
          </button>
        </div>
        {message && <p className="text-center text-green-500">{message}</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
      </form>
    </div>
  );
}

export default ServiceProvider;
