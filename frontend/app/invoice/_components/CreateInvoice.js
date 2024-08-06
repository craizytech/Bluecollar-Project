"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';

function CreateInvoice() {
  const [userId, setUserId] = useState('');
  const [serviceCost, setServiceCost] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [status, setStatus] = useState('pending'); // Default status
  const [description, setDescription] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePhone, setServicePhone] = useState('254');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      user_id: userId,
      service_cost: serviceCost,
      booking_id: bookingId,
      status: status,
      description: description,
      service_name: serviceName,
      service_phone: servicePhone,
    };

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post('http://localhost:5000/invoices', data, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess(response.data.message);
      setError(null);
    } catch (err) {
      setError(err.response ? err.response.data.error : 'Error creating invoice');
      setSuccess(null);
    }
  };

  const formattedDate = format(new Date(), 'dd/MM/yyyy'); // Format date consistently

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <Image src="/logo.svg" alt="logo" width={180} height={100} />
        <div>
          <p className="font-bold text-xl">Invoice Date: {formattedDate}</p>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-6">Create Invoice</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">From</label>
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              value="BlueCollar"
              readOnly
            />
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Service Name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
            />
            <input
              type="tel"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="254 700 000000"
              value={servicePhone}
              onChange={(e) => setServicePhone(e.target.value)}
              pattern="254[0-9]{9}"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Balance (KES)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            value={serviceCost}
            onChange={(e) => setServiceCost(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Service Description & Total</label>
          <table className="w-full border border-gray-300 rounded">
            <thead>
              <tr>
                <th className="p-2 border-b border-gray-300">Description</th>
                <th className="p-2 border-b border-gray-300">Total (KES)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-gray-300">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </td>
                <td className="p-2 border-b border-gray-300">
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Total (KES)"
                    value={serviceCost}
                    onChange={(e) => setServiceCost(e.target.value)}
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
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
