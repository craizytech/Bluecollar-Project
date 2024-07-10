"use client";
import { useState } from 'react';
import ServiceDetails from './_components/ServiceDetails';
import SuggestedBusinessList from './_components/SuggestedBusinessList';
import UserProfile from './_components/UserProfile';

function Page() {
  const [serviceId, setServiceId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  return (
    <div className='py-8 px-10 md:px-36'>
      <UserProfile setServiceId={setServiceId} setCategoryId={setCategoryId} />
      <div className='grid grid-cols-3 mt-16'>
        <div className='col-span-3 md:col-span-2 order-last md:order-first'>
          <ServiceDetails serviceId={serviceId} />
        </div>
        <div>
          <SuggestedBusinessList serviceId={serviceId} categoryId={categoryId} />
        </div>
      </div>
    </div>
  );
}

export default Page;
