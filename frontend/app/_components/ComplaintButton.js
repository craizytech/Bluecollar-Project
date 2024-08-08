"use client";
import React from 'react';

const ComplaintButton = () => {
  const handleClick = () => {
    const email = 'doitlikenjeri@gmail.com';
    const subject = 'Complaint Submission';
    const body = 'Please describe your complaint here...';

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-16 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition"
    >
      Send Complaint
    </button>
  );
};

export default ComplaintButton;
