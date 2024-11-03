"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ServiceDetails from './_components/ServiceDetails';
import SuggestedBusinessList from './_components/SuggestedBusinessList';
import UserProfile from './_components/UserProfile';
import { useDispatch } from 'react-redux';
import { setCategoryId } from '../store/slices/categorySlice';
import { Toaster } from 'sonner';

function Page() {
    const router = useRouter();
    const [serviceId, setServiceId] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const { searchParams } = new URL(window.location.href);
        const queryServiceId = searchParams.get('serviceId');
        const queryCategoryId = searchParams.get('categoryId');

        if (queryCategoryId) {
            console.log('Setting CategoryId:', queryCategoryId);
            dispatch(setCategoryId(queryCategoryId));
        }
        if (queryServiceId) {
            console.log('Setting ServiceId:', queryServiceId);
            setServiceId(queryServiceId);
        }
    }, [dispatch]);

    return (
        <div className='py-8 md:py-20 px-10 md:px-36'>
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
