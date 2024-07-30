import React, { useEffect, useState } from 'react';

function ChatComponent({ userId, receiverId }) { 
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [receiverProfilePicture, setReceiverProfilePicture] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchChatHistory = async () => {
      setLoading(true);
      console.log('Fetching chat history for user ID:', userId);
      try {
        // Fetch receiver's profile information
        const profileResponse = await fetch(`http://localhost:5000/api/users/profile/${receiverId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!profileResponse.ok) {
          const profileErrorData = await profileResponse.json();
          console.error('Profile fetch error:', profileErrorData.error);
          setError(profileErrorData.error || 'An error occurred while fetching profile.');
          return;
        }

        const profileData = await profileResponse.json();
        setReceiverName(profileData.user_name); 
        setReceiverProfilePicture(profileData.user_profile_picture);

        // Fetch chat history
        const response = await fetch(`http://localhost:5000/api/chats/history?receiver_id=${receiverId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fetch error:', errorData.error);
          setError(errorData.error || 'An error occurred while fetching chat history.');
        } else {
          const data = await response.json();
          console.log('Chat history data:', data);
          setChats(data);
        }
      } catch (error) {
        console.error('An error occurred while fetching chat history:', error);
        setError('An error occurred while fetching chat history.');
      } finally {
        setLoading(false);
      }
    };

    if (userId && receiverId) {
      fetchChatHistory();
    }
  }, [userId, receiverId]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      console.error('Message is empty');
      return;
    }

    if (!receiverId) {
      console.error('Receiver ID is missing');
      return;
    }

    setSending(true);

    try {
      console.log('Sending message:', { receiver_id: receiverId, message });

      const response = await fetch('http://localhost:5000/api/chats/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Send message error:', errorData.error);
        setError(errorData.error || 'An error occurred while sending the message.');
        return;
      }

      const newChat = await response.json();
      setChats((prevChats) => [...prevChats, newChat]);
      setMessage('');
    } catch (error) {
      console.error('An error occurred while sending the message:', error);
      setError('An error occurred while sending the message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col max-h-500 overflow-y-auto border border-gray-300 bg-gray-100">
      {loading && <p>Loading chat history...</p>}
      {error && <p className="text-red-500 font-bold">{error}</p>}
      <div className="flex items-center p-4 bg-teal-600 text-white border-b border-gray-300">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <img src={receiverProfilePicture} alt={`${receiverName}'s profile`} />
        </div>
        <div className="header-info">
          <h2 className="m-0 text-lg">{receiverName}</h2>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        {chats.map((chat) => {
          const isUserMessage = chat.sent_from.toString() === userId.toString();
          const messageAlignment = isUserMessage ? 'self-end text-right bg-green-200' : 'self-start text-left bg-blue-100';

          return (
            <div
              key={chat.chat_id}
              className={`flex flex-col mb-4 p-4 rounded-lg ${messageAlignment}`}
              style={{ maxWidth: '75%', wordWrap: 'break-word' }} // Adjust the width based on content
            >
              <p className="m-0">{chat.message}</p>
              <div className="text-sm text-gray-500 mt-1">
                {isUserMessage && chat.status === 'sent' && <span>Sent</span>}
              </div>
              <span className="text-sm text-gray-500">{new Date(chat.date_of_creation).toLocaleTimeString()}</span>
            </div>
          );
        })}
      </div>
      <div className="flex p-4 border-t border-gray-300 bg-white">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg mr-2"
        />
        <button
          onClick={handleSendMessage}
          disabled={sending}
          className={`p-2 px-4 rounded-lg ${
            sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ChatComponent;
