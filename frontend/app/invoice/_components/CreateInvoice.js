"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import InvoiceDisplay from './invoiceDisplay';

function CreateInvoice({ bookingId, receiverId }) {
  const [userId, setUserId] = useState('');
  const [serviceCost, setServiceCost] = useState('');
  const [status, setStatus] = useState('pending'); // Default status
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingInvoice, setExistingInvoice] = useState(null);
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    console.log('User ID:', storedUserId);
    setUserId(storedUserId || '');

    if (userId) {
      fetchInvoice();
      fetchUserProfile();
    }
  }, [userId]);
  

  const fetchInvoice = async () => {
    console.log('Fetching invoice for user:', userId);
    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.get(`http://localhost:5000/api/invoices/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Invoice fetched:', response.data);
      const invoiceData = response.data[0];
      if (invoiceData) {
        setExistingInvoice(invoiceData);
        setServiceCost(invoiceData.service_cost);
        setStatus(invoiceData.status);
      } else {
        console.log('No invoice data found');
        setExistingInvoice(null);
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setExistingInvoice(null);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.get(`http://localhost:5000/api/users/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('User profile fetched:', response.data);
      setUserProfile(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserProfile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!userId || !bookingId || !serviceCost) {
      console.error('User ID, booking ID, or service cost is missing');
      return;
    }
  
    const data = {
      user_id: userId,
      service_cost: serviceCost,
      booking_id: bookingId,
    };
  
    try {
      const token = localStorage.getItem('access_token');
      let response;
  
      if (existingInvoice && existingInvoice.invoice_id) {
        // Update existing invoice
        response = await axios.put(`http://localhost:5000/api/invoices/${existingInvoice.invoice_id}`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        console.log('Update response data:', response.data);
  
        if (response.data && response.data.message) {
          setSuccess(response.data.message);
          // Re-fetch invoice data to update the state
          await fetchInvoice();
        } else {
          setError('Error updating invoice: Invalid response');
        }
      } else {
        // Create new invoice
        response = await axios.post('http://localhost:5000/api/invoices/create', data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        console.log('Create response data:', response.data);
  
        if (response.data && response.data.invoice_id) {
          setExistingInvoice(response.data);
          setSuccess('Invoice created successfully');
        } else {
          setError('Error creating invoice: Invalid response');
        }
      }
  
      // Clear form and reset status
      setServiceCost('');
      setStatus('pending');
      setInvoiceCreated(true);
    } catch (err) {
      console.error('Error creating/updating invoice:', err);
      setError('Error creating/updating invoice');
    }
  };
  
  
  
  
  
  
  

  const handleDelete = async () => {
    console.log('Deleting invoice with ID:', existingInvoice?.invoice_id);
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token:', token);

      await axios.delete(`http://localhost:5000/api/invoices/${existingInvoice.invoice_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Invoice deleted successfully');
      setSuccess('Invoice deleted successfully');
      setError(null);
      setExistingInvoice(null);
      setUserId('');
      setServiceCost('');
      setStatus('pending');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError(err.response ? err.response.data.error : 'Error deleting invoice');
      setSuccess(null);
    }
  };

  const handleSendInvoice = () => {
    console.log('Receiver ID:', receiverId);
    console.log('Existing Invoice:', existingInvoice);
    if (!receiverId) {
      console.error('Receiver ID is missing');
      return;
    }
    if (!existingInvoice?.invoice_id) {
      console.error('Invoice ID is missing');
      return;
    }
    console.log('Sending invoice to chat:', { receiverId, invoiceId: existingInvoice.invoice_id });
    router.push(`/chat?receiverId=${receiverId}&invoiceId=${existingInvoice.invoice_id}&bookingId=${bookingId}`);
  };

  return (
    <InvoiceDisplay
      userProfile={userProfile}
      serviceCost={serviceCost}
      existingInvoice={existingInvoice}
      handleSubmit={handleSubmit}
      handleDelete={handleDelete}
      handleSendInvoice={handleSendInvoice}
      setServiceCost={setServiceCost}
      error={error}
      success={success}
      isEditable={true}
      preview={false}
    />

  );
}

export default CreateInvoice;
