"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BellIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser, setUser } from '../store/slices/userSlice';
import { clearNotifications, setNotifications } from '../store/slices/notificationSlice';
import Spinner from './spinner/Spinner';

function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const userEmail = useSelector((state) => state.user.userEmail);
  const userRole = useSelector((state) => state.user.userRole);
  const notifications = useSelector((state) => state.notifications.notifications);
  const dispatch = useDispatch();

  const notificationCount = notifications ? notifications.filter(notification => !notification.read).length : 0;

  const isActive = (href) => pathname === href ? 'text-blue-500' : 'text-black';

  useEffect(() => {
    // Check localStorage for user data
    const storedEmail = localStorage.getItem('user_email');
    const storedRole = localStorage.getItem('user_role');
    const storedUserId = localStorage.getItem('user_id')

    if (storedEmail && storedRole && storedUserId) {
      dispatch(setUser({ 
        userEmail: storedEmail, 
        userRole: parseInt(storedRole, 10), 
        userId: storedUserId 
      }));
      fetchNotifications(storedUserId);
    }
  }, [dispatch]);

  const fetchNotifications = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      if (data) {
        dispatch(setNotifications(data));
      } else {
        console.error('No notifications found');
      }
    } finally {
      setLoading(false); // Reset loading state after fetching notifications
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '';

  const handleLogout = () => {
      localStorage.clear();
      dispatch(clearUser());
      dispatch(clearNotifications());
      router.push('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (newMessage) {
      setNewMessage(false);
    }
  };

  const handleDropdownItemClick = async (href) => {
    setLoading(true);
    setDropdownOpen(false); // Close dropdown

    setLoading(false)
  };

  const isAdmin = () => userRole === 1;
  const isServiceProvider = () => userRole === 2;

  return (
    <div className="p-5 shadow-sm flex justify-between items-center">
    {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
          <Spinner />
        </div>
      )}
      <div className="flex items-center gap-8 z-10">
        <Image src='/logo.png' alt='logo' width={100} height={100} />
        <div className="md:flex items-center gap-6 hidden">
          <Link href="/Home" className={`hover:scale-105 hover:text-primary hover:cursor-pointer ${isActive('/Home')}`}>Home</Link>
          <Link href='/aboutUs' className={`hover:scale-105 hover:text-primary hover:cursor-pointer ${isActive('/aboutUs')}`}>About Us</Link>
          <Link href="/services" className={`hover:scale-105 hover:text-blue-500 hover:cursor-pointer ${isActive('/services')}`}>Services</Link>
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        {userEmail ? (
          <>
            <div className="relative">
              <button
                className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center"
                onClick={toggleDropdown}
              >
                { userInitial}
              </button>
              {dropdownOpen && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-20">
                  <ul className="list-none p-2">
                    <li>
                      <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={() => handleDropdownItemClick('/profile')}>Profile</Link>
                    </li>
                    <li>
                      <Link href="/mybooking" className="block px-4 py-2 hover:bg-gray-100" onClick={() => handleDropdownItemClick('/mybooking')}>My Bookings</Link>
                    </li>
                    {isServiceProvider() && (
                      <li>
                        <Link href="/todoServices" className="block px-4 py-2 hover:bg-gray-100" onClick={() => handleDropdownItemClick('/todoServices')}>To Do Services</Link>
                      </li>
                    )}
                    <li>
                      <Link href="/chat" className="block px-4 py-2 hover:bg-gray-100" onClick={() => handleDropdownItemClick('/chat')}>
                        Messages
                        {newMessage && <span className="bg-red-500 text-white rounded-full w-3 h-3 inline-block ml-2"></span>}
                      </Link>
                    </li>
                    <li>
                      <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100" onClick={() => handleDropdownItemClick('/settings')}>Settings</Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <Link href="/notifications" className="relative">
              <BellIcon className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notificationCount}
                </span>
              )}
            </Link>
            {isAdmin() && (
              <Link href="/admin/dashboard">
                <button className="bg-primary text-white rounded-lg py-2 px-4 hover:bg-primary-dark">
                  Dashboard
                </button>
              </Link>
            )}
            <button
              className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : null}
        {/* {loading && <Spinner />} */}
      </div>
    </div>
  );
}

export default Header;
