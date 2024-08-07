"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InvoiceDisplay from '@/app/invoice/_components/invoiceDisplay';

const formatPhoneNumber = (number) => {
  const cleanedNumber = number.replace(/\D/g, '');
  if (cleanedNumber.startsWith('0')) {
    return `254${cleanedNumber.substring(1)}`;
  }
  if (cleanedNumber.startsWith('254')) {
    return cleanedNumber;
  }
  return '';
};

const MpesaIntegrationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const initialPhoneNumber = searchParams.get('phoneNumber');

  const [invoice, setInvoice] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState(null);

  useEffect(() => {
    if (invoiceId) {
      const fetchInvoice = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              },
          });
          const data = await response.json();
          console.log('Fetched invoice:', data);

          const invoiceData = data.length > 0 ? data[0] : null;
          setInvoice(invoiceData);

          if (invoiceData) {
            // Fetch user profile
            const userResponse = await fetch(`http://localhost:5000/api/users/profile/${invoiceData.user_id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              },
            });
            const userData = await userResponse.json();
            console.log('Fetched user profile:', userData);
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Failed to fetch invoice:', error);
          setError('Failed to fetch invoice details.');
        }
      };

      fetchInvoice();
    } else {
      setError('Invoice ID is missing.');
    }
  }, [invoiceId]);

  useEffect(() => {
    setFormattedPhoneNumber(formatPhoneNumber(phoneNumber));
  }, [phoneNumber]);

  const handlePayment = async () => {
    if (!formattedPhoneNumber || !amount) {
      setError('Phone number and amount are required.');
      return;
    }

    setLoading(true);
    setError('');
    setTransactionStatus('pending');

    try {
      const response = await fetch('http://localhost:5000/api/mpesa/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          phone_number: formattedPhoneNumber,
          amount,
          invoice_id: invoiceId,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Payment initiated successfully:', result);
        // Handle response based on `ResultCode`
        if (result.ResultCode === "0") {
          setTransactionStatus('paid');
        } else if (result.ResultCode === "1032") {
          setTransactionStatus('cancelled');
        } else {
          setTransactionStatus('failed');
        }
      } else {
        setError(result.error || 'Failed to initiate payment.');
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      setError('Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">M-Pesa Payment Integration</h1>
      {error && <p className="text-red-500">{error}</p>}
      {transactionStatus === 'pending' && <p className="text-blue-500">Processing your payment, please wait...</p>}
      {transactionStatus === 'paid' && <p className="text-green-500">Payment successful!</p>}
      {transactionStatus === 'cancelled' && <p className="text-yellow-500">Payment was cancelled by the user.</p>}
      {transactionStatus === 'failed' && <p className="text-red-500">Payment failed. Please try again.</p>}
      {invoice && (
        <InvoiceDisplay
          userProfile={userProfile}
          serviceCost={invoice.service_cost}
          error={error}
          success=""
          isEditable={false} // For display purposes only
          preview={true}
        />
      )}
      <div className="mt-16 ml-12">
        <label className="block mb-2">Phone Number (format: 254...)</label>
        <input
          type="text"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          className="border border-gray-300 p-2 rounded mb-2 w-full"
          placeholder="Enter phone number"
        />
        <label className="block mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border border-gray-300 p-2 rounded mb-2 w-full"
          placeholder="Enter amount"
        />
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`mt-4 p-2 px-4 rounded-lg ${loading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        >
          {loading ? 'Processing...' : 'Pay via M-Pesa'}
        </button>
      </div>
    </div>
  );
};

export default MpesaIntegrationPage;
