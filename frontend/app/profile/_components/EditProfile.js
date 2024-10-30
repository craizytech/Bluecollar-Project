"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function EditProfile() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const userData = response.data;
        setFullname(userData.user_name);
        setEmail(userData.user_email);
        setPhoneNumber(userData.user_phone_number);
        setAddress(userData.user_address);
        setLocation(userData.user_location);
        setProfilePictureUrl(userData.user_profile_picture);
        setUserId(userData.user_id);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'fullname':
        setFullname(value);
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'location':
        setLocation(value);
        break;
      default:
        break;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
        setProfilePictureUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.put('http://localhost:5000/api/users/profile', {
        user_name: fullname,
        user_phone_number: phoneNumber,
        user_address: address,
        user_location: location,
        user_profile_picture: profilePicture // Send base64 data URL
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      toast('Profile updated successfully.', {
        style: {
          backgroundColor: "green",
          color: "white"
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast('Error updating profile. Please try again.', {
        style: {
          backgroundColor: "red",
          color: "white"
        }
      });
    }
  };

  const handleProfilePictureClick = () => {
    document.getElementById('profilePictureInput').click();
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-5 bg-white shadow-md rounded-md">
      <div className="flex mb-6 justify-between items-center">
        <div className="flex items-center">
          <div className="relative mr-4">
          <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <img
                    src={profilePictureUrl || '/default-profile.png'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover cursor-pointer"
                    onClick={handleProfilePictureClick}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to update your profile picture</p>
                </TooltipContent>
              </Tooltip>
          </TooltipProvider>
            <input
              type="file"
              id="profilePictureInput"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <h2 className="text-gray-600">You can edit your details down below</h2>
          </div>
        </div>
      </div>
      <form onSubmit={handleSaveChanges}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="fullname">Full Name</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            className="w-full px-3 py-2 border rounded-md"
            value={fullname}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 border rounded-md"
            value={email}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            className="w-full px-3 py-2 border rounded-md"
            value={phoneNumber}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            className="w-full px-3 py-2 border rounded-md"
            value={address}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            className="w-full px-3 py-2 border rounded-md"
            value={location}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
