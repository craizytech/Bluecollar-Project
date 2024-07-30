"use client"
import React, { useState} from 'react'
import SignupForm from '@/app/_components/forms/SignupForm'


const signup = () => {
  const [token, setToken] = useState('');
  return (
    <div>
      <SignupForm setToken={setToken}/>
    </div>
  )
}

export default signup