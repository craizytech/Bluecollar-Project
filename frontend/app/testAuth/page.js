"use client"
import React, {useState} from 'react'
import LoginFform from './_componentsss/LoginFform'

function page() {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token') || '';
    }
    return '';
});

  return (
    <div>
        <LoginFform setToken={setToken}/>
    </div>
  )
}

export default page