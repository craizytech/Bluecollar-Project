"use client";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useGeolocation from "@/app/hooks/useGeolocation";
import counties from "@/app/data/counties";

const SignupForm = ({ setToken, defaultLocation }) => {
  const [user_name, setName] = useState('');
  const [user_email, setEmail] = useState('');
  const [user_phone_number, setPhoneNumber] = useState('');
  const [user_address, setAddress] = useState('');
  const [user_location, setLocation] = useState(defaultLocation || ''); // Initialize with defaultLocation
  const [user_password, setPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [user_profile_picture, setProfilePicture] = useState('');
  const [role_id, setRoleId] = useState(3);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filteredCounties, setFilteredCounties] = useState([]); // For storing filtered counties
  const [showDropdown, setShowDropdown] = useState(false);
  const [county, setCounty] = useState(''); // For storing county

  const router = useRouter();
  const { location, error: geoError } = useGeolocation(); // Custom hook for geolocation

  useEffect(() => {
      if (location.latitude && location.longitude) {
          fetchCounty(location.latitude, location.longitude);
      }
  }, [location]);

  const fetchCounty = async (latitude, longitude) => {
      try {
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDeOZ6drkVM9-7UXiAIoLv6cVslMcNqUfM`);

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Geocoding API Response:', data);

          if (data.results && data.results.length > 0) {
              const addressComponents = data.results[0].address_components;
              console.log('Address Components:', addressComponents);

              // Log each address component
              addressComponents.forEach((component, index) => {
                  console.log(`Component ${index}:`, component);
              });

              const countyComponent = addressComponents.find(component => 
                  component.types.includes('administrative_area_level_2') || 
                  component.types.includes('administrative_area_level_1')
              );
              console.log('County Component:', countyComponent);

              if (countyComponent) {
                  let countyName = countyComponent.long_name.replace(' County', '').trim();
                  const fullCountyName = `${countyName}, Kenya`;

                  if (counties.includes(fullCountyName)) {
                      setCounty(fullCountyName);
                      setLocation(fullCountyName); // Set the user_location to the detected county
                  } else {
                      console.log('County not found in list');
                      setCounty('Unknown location');
                      setLocation('Unknown location'); // Set the user_location to 'Unknown location'
                  }
              } else {
                  console.log('County component not found');
                  setCounty('Unknown location');
                  setLocation('Unknown location'); // Set the user_location to 'Unknown location'
              }
          } else {
              console.log('Geocoding API returned no results');
              setCounty('Unknown location');
              setLocation('Unknown location'); // Set the user_location to 'Unknown location'
          }
      } catch (error) {
          console.error('Error fetching county:', error);
          setCounty('Unknown location');
          setLocation('Unknown location'); // Set the user_location to 'Unknown location'
      }
  };

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

  const handleSearchLocation = (e) => {
    const query = e.target.value;
    setSearchLocation(query);

    if (query) {
        const filtered = counties.filter(county => 
            county.toLowerCase().startsWith(query.toLowerCase())
        );
        setFilteredCounties(filtered);
        setShowDropdown(true);
    } else {
        setShowDropdown(false);
    }
  };

  const handleSelectCounty = (county) => {
    setLocation(county);
    setSearchLocation(county);
    setShowDropdown(false);
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
                  user_location: user_location, // Use the detected county
                  user_profile_picture,
                  role_id
              }),
          });

          const data = await response.json();
          if (response.ok) {
              setSuccess('Signup successful! Redirecting to login...');
              setTimeout(() => {
                  router.push('/');
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
    <div className="flex items-center justify-center  bg-gray-100">
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="number"
                            value={user_phone_number} onChange={(e) => setPhoneNumber(e.target.value)} required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            type="text"
                            value={user_address} onChange={(e) => setAddress(e.target.value)} required 
                        />
                    </div>

                    <div className="space-y-2 relative">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          type="text"
                          placeholder="Enter location"
                          value={searchLocation}
                          onChange={handleSearchLocation}
                          required
                        />
                        {showDropdown && (
                          <ul className="absolute z-10 bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto">
                            {filteredCounties.map((county, index) => (
                              <li
                                key={index}
                                className="p-2 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleSelectCounty(county)}
                              >
                                {county}
                              </li>
                            ))}
                          </ul>
                        )}
                        {geoError && <p style={{ color: 'red' }}>{geoError}</p>}
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
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm Password</Label>
                        <Input
                            id="confirm_password"
                            name="confirm_password"
                            type="password"
                            placeholder="confirm password"
                            value={confirm_password} onChange={(e) => setConfirmPassword(e.target.value)} required
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
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        {success && <p className="text-green-500 text-center mt-2">{success}</p>}
    </div>
</div>
  );
};

export default SignupForm;
