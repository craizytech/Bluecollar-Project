import React from 'react'
import UserProfile from './_components/UserProfile'
import ServiceDetails from './_components/ServiceDetails'
import SuggestedBusinessList from './_components/SuggestedBusinessList'

function booking() {
  return (
    <div className='py-8 md:px-20 px-10 md:px-36'>
        <UserProfile />

        <div className='grid grid-cols-3 mt-16'>
            <div className='col-span-3 md:col-span-2 order-last md:order-first'>
                <ServiceDetails />
            </div>
            <div>
                <SuggestedBusinessList />
            </div>
        </div>
    </div>
  )
}

export default booking