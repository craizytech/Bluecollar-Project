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
            const response = await fetch('http://localhost:5000/api/auth/login', {
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

    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         const storedToken = localStorage.getItem('access_token');
    //         updateToken(storedToken || '');
    //         setToken(storedToken || '');
    //         if (storedToken) {
    //             fetchUserProfile(storedToken);
    //         }
    //     }
    // }, [setToken]);


    // const fetchUserProfile = async (token) => {
    //     try {
    //         const response = await fetch('http://localhost:5000/api/users/profile', {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //             },
    //         });

    //         if (response.ok) {
    //             const userData = await response.json();
    //             setProfile(userData);
    //         } else {
    //             const errorData = await response.json();
    //             setError(errorData.error);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching profile:', error);
    //         setError('Failed to fetch user profile');
    //     }
    // };

    // if (token && profile) {
    //     return (
    //         <div>
    //             <h2>User Profile</h2>
    //             <Image
    //                 src={`data:image/jpeg;base64,${profile.user_profile_picture}`}
    //                 alt={profile.user_name || 'User profile picture'}
    //                 width={150}
    //                 height={200}
    //                 className='rounded-full h-[150px] object-cover'
    //              />
    //             <p>Email: {profile.user_email}</p>
    //             <p>Name: {profile.user_name}</p>
    //             <p>Phone Number: {profile.user_phone_number}</p>
    //             <p>Address: {profile.user_address}</p>
    //             <p>Location: {profile.user_location}</p>
    //             <button onClick={() => {
    //                 localStorage.removeItem('access_token');
    //                 updateToken('');
    //                 setProfile(null);
    //             }}>Logout</button>
    //         </div>
    //     );
    // }

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
