"use client";
import LoginForm from '@/app/_components/forms/LoginForm';
import React, { useState } from 'react';


function Login() {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || '';
    }
    return '';
  });

  return (
    <div>
      <LoginForm setToken={setToken} />
    </div>
  );
}

export default Login;