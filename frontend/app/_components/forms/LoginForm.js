"use client";
import React, { useContext, useState } from 'react'
import { useRouter } from 'next/navigation';
import Link from "next/link";
import AuthContext from './AuthContext';
// import { useFormState } from "react-dom";
// import { loginUserAction } from "@/data/actions/auth-actions";

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
// import { ZodErrors } from "@/components/custom/ZodErrors";
// import { StrapiErrors } from "@/components/custom/StrapiErrors";
// import { SubmitButton } from "@/components/custom/SubmitButton";
import { Button } from "@/components/ui/button";

const INITIAL_STATE = {
  zodErrors: null,
  strapiErrors: null,
  data: null,
  message: null,
};

const LoginForm = ({ setToken }) => {
  const [user_email, setEmail] = useState('');
    const [user_password, setPassword] = useState('');
    const [token, updateToken] = useState('');
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');

    const { setTokenAndProfile } = useContext(AuthContext);
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
                // updateToken(data.access_token);
                // setToken(data.access_token);
                // if (typeof window !== 'undefined') {
                //     localStorage.setItem('access_token', data.access_token);
                // }
                
                // fetchUserProfile(data.access_token);
                setTokenAndProfile(data.access_token);
                router.push('/');
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError('Failed to login');
        }
      };
  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your details to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="username or email"
                value={user_email} onChange={(e) => setEmail(e.target.value)} required
              />
              {/* <ZodErrors error={formState?.zodErrors?.identifier} /> */}
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
              {/* <ZodErrors error={formState.zodErrors?.password} /> */}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              className="w-full"
              // loadingText="Loading"
            > Sign In </Button>
            {/* <StrapiErrors error={formState?.strapiErrors} /> */}
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Don't have an account?
          <Link className="underline ml-2" href="signup">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;