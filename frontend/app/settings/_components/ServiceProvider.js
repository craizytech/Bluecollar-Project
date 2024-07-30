"use client";
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import CategoryContext from '@/app/context/CategoryContext';

function ServiceProvider() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const { categoryId, setCategoryId } = useContext(CategoryContext); // Use the context
  const [selectedService, setSelectedService] = useState('');
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
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
        setUserId(response.data.user_id); // Assuming the response contains user_id
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
    // e.preventDefault();

    // try {
    //   const token = localStorage.getItem('access_token');
    //   if (!token) {
    //     throw new Error('No token found');
    //   }

    //   const data = {
    //     email,
    //     category_id: categoryId,
    //     service_id: selectedService
    //   };

    //   const response = await axios.post('http://localhost:5000/api/apply-provider', data, {
    //     headers: {
    //       Authorization: `Bearer ${token}`
    //     }
    //   });

      setMessage('Your application has been submitted. Please wait for approval by the admin.');
    // } catch (error) {
    //   console.error('Error submitting application:', error);
    //   setMessage('There was an error submitting your application. Please try again.');
    // }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }

      const data = {
        service_name: newServiceName,
        service_description: newServiceDescription,
        category_id: categoryId,
        provider_id: userId
      };

      await axios.post('http://localhost:5000/api/services/create', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage('Your service creation request has been submitted. Please wait for approval by the admin.');
      setNewServiceName('');
      setNewServiceDescription('');
      setShowNewServiceForm(false);
    } catch (error) {
      console.error('Error creating service:', error);
      setMessage('There was an error creating the service. Please try again.');
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
            value={categoryId}
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
            onChange={(e) => {
              if (e.target.value === 'new') {
                setShowNewServiceForm(true);
              } else {
                setShowNewServiceForm(false);
                setSelectedService(e.target.value);
              }
            }}
            disabled={!categoryId}
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.service_id} value={service.service_id}>
                {service.service_name}
              </option>
            ))}
            <option value="new" className='text-green-500'>Add New Service</option>
          </select>
        </div>
        {showNewServiceForm && (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">New Service</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="newServiceName">Service Name</label>
              <input
                type="text"
                id="newServiceName"
                name="newServiceName"
                className="w-full px-3 py-2 border rounded-md"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="newServiceDescription">Service Description</label>
              <textarea
                id="newServiceDescription"
                name="newServiceDescription"
                className="w-full px-3 py-2 border rounded-md"
                value={newServiceDescription}
                onChange={(e) => setNewServiceDescription(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300"
              onClick={handleCreateService}
            >
              Request Service Creation
            </button>
          </div>
        )}
        <div className="mb-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Apply
          </button>
        </div>
        {message && <p className="text-center text-green-500">{message}</p>}
      </form>
    </div>
  );
}

export default ServiceProvider;
