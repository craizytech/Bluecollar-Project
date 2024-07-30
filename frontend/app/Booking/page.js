"use client";
import { useState, useEffect } from 'react';
import ServiceDetails from './_components/ServiceDetails';
import SuggestedBusinessList from './_components/SuggestedBusinessList';
import UserProfile from './_components/UserProfile';
import { useCategory } from '../context/CategoryContext';
import { Toaster} from 'sonner'

function Page({ categoryId: initialCategoryId}) {
  const [serviceId, setServiceId] = useState(null);
  const { setCategoryId } = useCategory();

  useEffect(() => {
    if (initialCategoryId) {
        setCategoryId(initialCategoryId);
    }
}, [initialCategoryId, setCategoryId]);

  return (
    <div className='py-8 px-10 md:px-36'>
    <Toaster />
      <UserProfile setServiceId={setServiceId} />
      <div className='grid grid-cols-3 mt-16'>
        <div className='col-span-3 md:col-span-2 order-last md:order-first'>
          <ServiceDetails serviceId={serviceId} />
        </div>
        <div>
          <SuggestedBusinessList serviceId={serviceId} />
        </div>
      </div>
    </div>
  );
}

export default Page;
