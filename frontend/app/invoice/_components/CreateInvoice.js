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
  const[invoiceId, setInvoiceId] = useState('')
  const [existingInvoice, setExistingInvoice] = useState(null);
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    console.log('User ID:', storedUserId);
    setUserId(storedUserId || '');

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);
  

  const fetchInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.get(`http://localhost:5000/api/invoices/${invoiceId}`, {
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
      setError('Navigate to To Do Services to create an invoice for each booking');
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
  
      // Create new invoice
      const response = await axios.post('http://localhost:5000/api/invoices/create', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Create response data:', response.data);
  
      // Check if response contains invoice_id
      if (response.data && response.data.invoice_id) {
        // Set the newly created invoice
        setInvoiceId(response.data.invoice_id);
        setExistingInvoice(response.data);
        setSuccess('Invoice created successfully');
  
        // Fetch the newly created invoice
        await fetchInvoice(response.data.invoice_id);
      } else if (response.data && response.data.message) {
        // Handle the case where only a success message is returned
        setSuccess(response.data.message);
        console.warn('Invoice ID not returned. Cannot fetch invoice.');
  
        // Optionally, fetch invoice by other means if necessary
      } else {
        console.error('Create response data is invalid:', response.data);
        setError('Error creating invoice: Invalid response');
      }
  
      // Clear form and reset status
      setServiceCost('');
      setStatus('pending');
      setInvoiceCreated(true);
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Error creating invoice');
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
