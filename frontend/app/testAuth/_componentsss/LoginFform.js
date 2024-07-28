import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const LoginFform = ({ setToken }) => {
    const [user_email, setEmail] = useState('');
    const [user_password, setPassword] = useState('');
    const [token, updateToken] = useState('');
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_email, user_password }),
            });

            const data = await response.json();
            if (response.ok) {
                updateToken(data.access_token);
                setToken(data.access_token);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', data.access_token);
                }
                
                // fetchUserProfile(data.access_token);

                router.push('/')
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError('Failed to login');
        }
    };

    
    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="email" value={user_email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={user_password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <br />
                <button type="submit">Login</button>
                <p>Don't have an account? <Link href={'/register'} className='text-primary'>Sign Up</Link></p>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default LoginFform;
