"use client"
import React, { useState} from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SignupFform = ({setToken}) => {
    const [user_name, setName] = useState('');
    const [user_email, setEmail] = useState('');
    const [user_phone_number, setPhoneNumber] = useState('');
    const [user_address, setAddress] = useState('');
    const [user_location, setLocation] = useState('');
    const [user_password, setPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [user_profile_picture, setProfilePicture] = useState('');
    const [role_id, setRoleId] = useState(2);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (user_password !== confirm_password) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        setSuccess('');
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name,
                    user_email,
                    user_password,
                    user_phone_number,
                    user_address,
                    user_location,
                    user_profile_picture,
                    role_id
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess('Signup successful! Redirecting to login...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.error);
                }
            } catch (error) {
                console.error('Signup failed:', error);
                setError('Failed to signup');
            }
        };

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Full Name:
                    <input type="text" value={user_name} onChange={(e) => setName(e.target.value)} required />
                </label>
                <br />
                <label>
                    Email:
                    <input type="email" value={user_email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <br />
                <label>
                    Phone Number:
                    <input type="text" value={user_phone_number} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </label>
                <br />
                <label>
                    Address:
                    <input type="text" value={user_address} onChange={(e) => setAddress(e.target.value)} required />
                </label>
                <br />
                <label>
                    Location:
                    <input type="text" value={user_location} onChange={(e) => setLocation(e.target.value)} required />
                </label>
                <br />
                <label>
                    Profile Picture:
                    <input type="file" accept="image/*" onChange={handleFileChange} required />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={user_password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <br />
                <label>
                    Confirm Password:
                    <input type="password" value={confirm_password} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </label>
                <br />
                <Button type="submit">Sign Up</Button>
                <p>Already a user? <Link href={'/testAuth'} className='text-primary'>Log in here</Link></p>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
};

export default SignupFform