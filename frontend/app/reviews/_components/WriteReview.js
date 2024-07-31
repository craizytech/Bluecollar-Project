"use client";
import React, { useState } from 'react';

function WriteReview({ service_id, provider_id }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/api/reviews/write', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ service_id, provider_id, rating, comment })
    });

    if (response.ok) {
      setMessage('Review submitted successfully!');
      setRating(0);
      setComment('');
    } else {
      const data = await response.json();
      setMessage(`Error: ${data.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Write a Review</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating:
          </label>
          <div className="flex space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                onClick={() => handleStarClick(star)}
                className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-9.19-1.34L12 2 11.19 7.9 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment:
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Review
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default WriteReview;
