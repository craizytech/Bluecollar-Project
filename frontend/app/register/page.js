"use client"
import React, { useState} from 'react'
import SignupFform from './_components/SignupFform';

const page = () => {
    const [token, setToken] = useState('');
  return (
    <div>
        <SignupFform setToken={setToken}/>
    </div>
  )
}

export default page
