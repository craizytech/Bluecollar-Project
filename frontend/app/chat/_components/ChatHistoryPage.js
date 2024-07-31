"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatComponent from './ChatComponent';

function ChatHistoryPage() {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchChatPartners = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chats/partners', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fetch error:', errorData.error);
          setError(errorData.error || 'An error occurred while fetching chat partners.');
          return;
        }

        const data = await response.json();
        setPartners(data);
        if (data.length > 0) {
          setSelectedPartner(data[0].user_id);
        }
      } catch (error) {
        console.error('An error occurred while fetching chat partners:', error);
        setError('An error occurred while fetching chat partners.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatPartners();
  }, []);

  const handlePartnerClick = (userId) => {
    setSelectedPartner(userId);
  };

  return (
    <div className="flex">
      <div className="w-1/4 border-r border-gray-300">
        <h2 className="p-4 text-lg font-bold">Chat Partners</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500 font-bold">{error}</p>}
        <ul>
          {partners.map((partner) => (
            <li
              key={partner.user_id}
              onClick={() => handlePartnerClick(partner.user_id)}
              className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${selectedPartner === partner.user_id ? 'bg-gray-200' : ''}`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img src={partner.user_profile_picture} alt={`${partner.user_name}'s profile`} />
              </div>
              <span className="text-lg">{partner.user_name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 p-4">
        {selectedPartner ? (
          <ChatComponent userId={localStorage.getItem('user_id')} receiverId={selectedPartner} />
        ) : (
          <p>Select a user to start chatting.</p>
        )}
      </div>
    </div>
  );
}

export default ChatHistoryPage;
