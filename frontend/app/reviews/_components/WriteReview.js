"use client";
import React, { useState, useEffect } from 'react';

function WriteReview({ service_id, provider_id }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    const fetchExistingReview = async () => {
      try {
        console.log('Fetching existing review...');
        const response = await fetch('http://localhost:5000/api/reviews/client', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
  
        if (response.ok) {
          const reviews = await response.json();
          console.log('Reviews fetched:', reviews);
  
          // Convert service_id and provider_id to strings for comparison
          const serviceIdStr = service_id.toString();
          const providerIdStr = provider_id.toString();
  
          console.log('Service ID:', serviceIdStr);
          console.log('Provider ID:', providerIdStr);
  
          const review = reviews.find(r => {
            const reviewServiceIdStr = r.service_id.toString();
            const reviewProviderIdStr = r.provider_id.toString();
            return reviewServiceIdStr === serviceIdStr && reviewProviderIdStr === providerIdStr;
          });
  
          if (review) {
            console.log('Existing review found:', review);
            setExistingReview(review);
            setRating(review.rating);
            setComment(review.comment);
          } else {
            console.log('No review found for service_id and provider_id:', serviceIdStr, providerIdStr);
            // Clear existing review state if none found
            setExistingReview(null);
          }
        } else {
          const error = await response.json();
          console.error('Error fetching existing review:', error);
        }
      } catch (error) {
        console.error('Error fetching existing review:', error);
        setMessage('Error fetching existing review');
      }
    };
  
    fetchExistingReview();
  }, [service_id, provider_id]);
  
  

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting review...');
    if (existingReview) {
      // Update existing review
      const response = await fetch(`http://localhost:5000/api/reviews/${existingReview.review_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (response.ok) {
        setMessage('Review updated successfully!');
      } else {
        const data = await response.json();
        console.error('Error updating review:', data);
        setMessage(`Error: ${data.message}`);
      }
    } else {
      // Submit new review
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
        console.error('Error submitting review:', data);
        setMessage(`Error: ${data.message}`);
      }
    }
  };

  const handleDelete = async () => {
    if (existingReview) {
      console.log('Deleting review...');
      const response = await fetch(`http://localhost:5000/api/reviews/${existingReview.review_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        setMessage('Review deleted successfully!');
        setExistingReview(null);
        setRating(0);
        setComment('');
      } else {
        const data = await response.json();
        console.error('Error deleting review:', data);
        setMessage(`Error: ${data.message}`);
      }
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {existingReview ? 'Update Your Review' : 'Write a Review'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating:</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Comment:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex space-x-28">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {existingReview ? 'Update Review' : 'Submit Review'}
          </button>
          {existingReview && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Review
            </button>
          )}
        </div>
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
