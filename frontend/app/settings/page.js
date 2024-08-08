"use client"
import React, { useState, useEffect } from 'react';
import ServiceProvider from './_components/ServiceProvider';
import { useRouter } from 'next/navigation';

function Page() {
  const [showServiceProvider, setShowServiceProvider] = useState(false);
  const router = useRouter();

  const handleApplyToBeServiceProvider = () => {
    setShowServiceProvider(true);
  };


  return (
    <div className="max-w-lg mx-auto mt-10 p-5 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>
      <div className="flex flex-col space-y-8 mb-6">
        <button
          onClick={handleApplyToBeServiceProvider}
          className="bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 transition duration-300 text-sm"
        >
          Apply to be a Service Provider
        </button>
      </div>
      {showServiceProvider && <ServiceProvider />}
    </div>
  );
}

export default Page;
