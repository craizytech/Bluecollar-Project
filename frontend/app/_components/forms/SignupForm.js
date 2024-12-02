"use client";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useGeolocation from "@/app/hooks/useGeolocation";
import { useSelector, useDispatch } from 'react-redux';
import { setError as setReduxError, setAddress } from '../../store/slices/location';

const SignupForm = ({ setToken }) => {
    const dispatch = useDispatch();
    const geoError = useSelector((state) => state.location.error);
    const reduxAddress = useSelector((state) => state.location.address);

    const [user_name, setName] = useState('');
    const [user_email, setEmail] = useState('');
    const [user_phone_number, setPhoneNumber] = useState('');
    const [user_address, setAddressLocal] = useState(reduxAddress); // Renamed state to avoid conflict
    const [userLocation, setLocation] = useState(''); // Location will be set based on geolocation
    const [user_password, setPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [user_profile_picture, setProfilePicture] = useState('');
    const [role_id, setRoleId] = useState(3);
    const [formSuccess, setFormSuccess] = useState(''); // Renamed success state to avoid conflict
    const [formError, setFormError] = useState(''); // Renamed error state to avoid conflict
    
    const router = useRouter();
    const { location, error: geoErrorLocation } = useGeolocation();

    useEffect(() => {
        if (location.latitude && location.longitude) {
            setLocation(`${location.latitude}, ${location.longitude}`);

            const fetchAddress = async () => {
                try {
                    const response = await fetch(`https://geocode.maps.co/reverse?lat=${location.latitude}&lon=${location.longitude}&api_key=672958dc30760969524851ktj2e0ae5`);
                    const data = await response.json();
                    
                    if (data.address) {
                        const formattedAddress = data.address.amenity
                            ? `${data.address.amenity}, ${data.address.road}, ${data.address.county}`
                            : `${data.display_name}`;
                        
                        setAddressLocal(formattedAddress);
                        dispatch(setAddress(formattedAddress)); // Update Redux store if needed
                    } else {
                        console.error('Geocoding error: Address not found');
                    }
                } catch (error) {
                    console.error('Error fetching address:', error);
                }
            };
            

            fetchAddress();
        }
    }, [location]);

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
            setFormError('Passwords do not match');
            return;
        }
        setFormError('');
        setFormSuccess('');
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
                    user_location: userLocation, // Sending the current location
                    user_profile_picture,
                    role_id
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setFormSuccess('Signup successful! Redirecting to login...');
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                setFormError(data.error);
            }
        } catch (error) {
            console.error('Signup failed:', error);
            setFormError('Failed to signup');
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
                            <CardDescription>Enter your details to create a new account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Name</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="username"
                                    value={user_name || ''}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={user_email || ''}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="number"
                                    value={user_phone_number || ''}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    type="text"
                                    value={user_address || ''}
                                    onChange={(e) => setAddressLocal(e.target.value)} // Use the renamed state
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={user_address || ''}
                                    disabled
                                />
                                {geoErrorLocation && <p style={{ color: 'red' }}>{geoErrorLocation}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="picture">Profile Picture</Label>
                                <Input
                                    id="picture"
                                    name="picture"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="password"
                                    value={user_password || ''}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm Password</Label>
                                <Input
                                    id="confirm_password"
                                    name="confirm_password"
                                    type="password"
                                    placeholder="confirm password"
                                    value={confirm_password || ''}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            <Button className="w-full" type="submit">Sign Up</Button>
                        </CardFooter>
                    </Card>
                    <div className="mt-4 text-center text-sm">
                        Have an account?
                        <Link className="underline ml-2 " href="/">Sign In</Link>
                    </div>
                </form>
                {formError && <p className="text-red-500 text-center mt-2">{formError}</p>} {/* Renamed error */}
                {formSuccess && <p className="text-green-500 text-center mt-2">{formSuccess}</p>} {/* Renamed success */}
            </div>
        </div>
    );
};

export default SignupForm;
