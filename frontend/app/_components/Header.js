"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

function Header() {
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newMessage, setNewMessage] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    setUserEmail(email);
    setUserRole(role);
  }, []);

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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_email');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      router.push('/');
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);

    if (newMessage) {
      setNewMessage(false);
    }
  };

  const isServiceProvider = () => {
    return userRole === '2';
  };

  return (
    <div className="p-5 shadow-sm flex justify-between items-center">
      <div className="flex items-center gap-8">
        <Image src='/logo.svg' alt='logo' width={180} height={100} />
        <div className="md:flex items-center gap-6 hidden">
          <Link href="/Home" className="hover:scale-105 hover:text-primary hover:cursor-pointer">Home</Link>
          <h2 className="hover:scale-105 hover:text-primary hover:cursor-pointer">About Us</h2>
          <h2 className="hover:scale-105 hover:text-primary hover:cursor-pointer">Services</h2>
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        {userEmail ? (
          <>
            <div className="relative">
              <button
                className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center"
                onClick={toggleDropdown}
              >
                {userInitial}
              </button>
              {dropdownOpen && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                  <ul className="list-none p-2">
                    <li>
                      <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Profile</Link>
                    </li>
                    <li>
                      <Link href="/mybooking" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>My Bookings</Link>
                    </li>
                    {isServiceProvider() && (
                      <li>
                        <Link href="/todoServices" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>To Do Services</Link>
                      </li>
                    )}
                    <li>
                      <Link href="/chat" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                        Messages
                        {newMessage && <span className="bg-red-500 text-white rounded-full w-3 h-3 inline-block ml-2"></span>}
                      </Link>
                    </li>
                    <li>
                      <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Settings</Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            {isServiceProvider() && (
              <Link href="/invoice">
                <button className="bg-primary text-white rounded-lg py-2 px-4 hover:bg-primary-dark">
                  Create Invoice
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
      </div>
    </div>
  );
}

export default Header;
