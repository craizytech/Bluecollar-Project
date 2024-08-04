"use client";
import React, { useState, useEffect } from 'react';

function ViewReviews({ service_id }) {
  const [reviews, setReviews] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (service_id) {
      const fetchServiceAndReviews = async () => {
        try {
          // Fetch service details
          const serviceResponse = await fetch(`http://localhost:5000/api/services/${service_id}`);
          if (!serviceResponse.ok) {
            throw new Error('Failed to fetch service details');
          }
          const serviceData = await serviceResponse.json();
          
          // Fetch reviews
          const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/service/${service_id}`);
          if (!reviewsResponse.ok) {
            throw new Error('Failed to fetch reviews');
          }
          const reviewsData = await reviewsResponse.json();
          
          // Map client details
          const clientsMap = serviceData.reviews.reduce((acc, review) => {
            if (review.client_id) {
              acc[review.client_id] = review.client_name; // Assuming client_name is in the reviews data
            }
            return acc;
          }, {});
          
          setClients(clientsMap);
          setReviews(reviewsData);
        } catch (error) {
          console.error('Error fetching service or reviews:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchServiceAndReviews();
    } else {
      setLoading(false);
    }
  }, [service_id]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  if (!service_id) {
    return <p className="text-center text-red-500">No service ID provided.</p>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reviews</h1>
      {reviews.length ? (
        <ul className="space-y-4">
          {reviews.map(review => (
            <li key={review.review_id} className="p-4 border border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <div className="font-semibold text-lg text-blue-600">
                  {clients[review.client_id] || 'Client Name'}
                </div>
                <div className="ml-auto flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-5 h-5 ${index < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                      >
                        <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{review.date_of_creation}</p>
              <p className="text-gray-700 italic">{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No reviews found for this service.</p>
      )}
    </div>
  );
}

export default ViewReviews;
