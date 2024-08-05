"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function CreateInvoice() {
  const [userId, setUserId] = useState('');
  const [serviceCost, setServiceCost] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [status, setStatus] = useState('pending'); // Default status
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      user_id: userId,
      service_cost: serviceCost,
      booking_id: bookingId,
      status: status
    };

    try {
      const token = localStorage.getItem('access_token'); // Retrieve the token from local storage
      const response = await axios.post('http://localhost:5000/invoices', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess(response.data.message);
      setError(null);
      // Optionally, redirect or reset the form
      // router.push('/some-other-page'); // Redirect to another page
    } catch (err) {
      setError(err.response ? err.response.data.error : 'Error creating invoice');
      setSuccess(null);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Create Invoice</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">User ID</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Service Cost</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            value={serviceCost}
            onChange={(e) => setServiceCost(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Booking ID</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Status</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded hover:bg-primary-dark"
        >
          Create Invoice
        </button>
      </form>
    </div>
  );
}

export default CreateInvoice;
