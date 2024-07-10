"use client";
import Link from "next/link";
import React, { useState} from 'react'
import { useRouter } from 'next/navigation';

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { ZodErrors } from "@/components/custom/ZodErrors";
// import { StrapiErrors } from "@/components/custom/StrapiErrors";
// import { SubmitButton } from "@/components/custom/SubmitButton";

// const INITIAL_STATE = {
//   data: null,
//   zodErrors: null,
//   message: null,
// };

const SignupForm = ({setToken}) => {
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
            const response = await fetch('http://localhost:5000/api/auth/register', {
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
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Name</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                value={user_name} onChange={(e) => setName(e.target.value)} required
              />
              {/* <ZodErrors error={formState?.zodErrors?.username} /> */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={user_email} onChange={(e) => setEmail(e.target.value)} required
              />
              {/* <ZodErrors error={formState?.zodErrors?.email} /> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="number"
                value={user_phone_number} onChange={(e) => setPhoneNumber(e.target.value)} required
              />
              {/* <ZodErrors error={formState?.zodErrors?.email} /> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={user_address} onChange={(e) => setAddress(e.target.value)} required 
              />
              {/* <ZodErrors error={formState?.zodErrors?.email} /> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={user_location} onChange={(e) => setLocation(e.target.value)} required 
              />
              {/* <ZodErrors error={formState?.zodErrors?.email} /> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="picture">Profile Picture</Label>
              <Input
                id="picture"
                name="picture"
                type="file"
                accept="image/*" 
                onChange={handleFileChange} required 
              />
              {/* <ZodErrors error={formState?.zodErrors?.email} /> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                value={user_password} onChange={(e) => setPassword(e.target.value)} required
              />
              {/* <ZodErrors error={formState?.zodErrors?.password} /> */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                value={confirm_password} onChange={(e) => setConfirmPassword(e.target.value)} required
              />
              {/* <ZodErrors error={formState?.zodErrors?.password} /> */}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
          <Button
              className="w-full"
              type="submit"
              // loadingText="Loading"
            > Sign Up </Button>
            {/* <StrapiErrors error={formState?.strapiErrors} /> */}
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Have an account?
          <Link className="underline ml-2" href="login">
            Sign In
          </Link>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default SignupForm