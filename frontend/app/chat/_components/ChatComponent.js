"use client";
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faImage } from '@fortawesome/free-solid-svg-icons';
import { format, isSameDay } from 'date-fns';

function ChatComponent({ userId, receiverId }) { 
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [receiverProfilePicture, setReceiverProfilePicture] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [image, setImage] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      setLoading(true);
      console.log('Fetching chat history for user ID:', userId);
      try {
        // Fetch receiver's profile information
        const profileResponse = await fetch(`http://localhost:5000/api/users/profile/${receiverId}`, {
          method: 'GET',
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
        const chatResponse = await fetch(`http://localhost:5000/api/chats/history/${receiverId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
    
        if (!chatResponse.ok) {
          const errorData = await chatResponse.json();
          console.error('Fetch error:', errorData.error);
          setError(errorData.error || 'An error occurred while fetching chat history.');
        } else {
          const data = await chatResponse.json();
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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setImage(null);
    setFilePreview(null);

    if (selectedFile) {
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);

    if (selectedImage) {
      setImagePreview(URL.createObjectURL(selectedImage));
    }
  };

  const renderChats = () => {
    let lastDate = null;
  
    return chats.map((chat) => {
      const chatDate = new Date(chat.date_of_creation);
  
      if (isNaN(chatDate.getTime())) {
        console.error('Invalid date value:', chat.date_of_creation);
        return null; // Skip rendering if the date is invalid
      }
  
      const isNewDate = !lastDate || !isSameDay(chatDate, lastDate);
      lastDate = chatDate;
      const formattedDate = format(chatDate, 'MMMM d, yyyy');
  
      const isUserMessage = chat.sent_from && chat.sent_from.toString() === userId.toString();
      const messageAlignment = isUserMessage ? 'self-end text-right bg-green-200' : 'self-start text-left bg-blue-100';
  
      return (
        <React.Fragment key={chat.chat_id}>
          {isNewDate && (
            <div className="flex justify-center my-2">
              <span className="px-4 py-2 bg-gray-200 rounded-full">{formattedDate}</span>
            </div>
          )}
          <div
            className={`flex flex-col mb-4 p-4 rounded-lg ${messageAlignment}`}
            style={{ maxWidth: '75%', wordWrap: 'break-word' }} // Adjust the width based on content
          >
            <p className="m-0">{chat.message}</p>
            <div className="text-sm text-gray-500 mt-1">
              {isUserMessage && chat.status === 'sent' && <span>Sent</span>}
            </div>
            <span className="text-sm text-gray-500">{chatDate.toLocaleTimeString()}</span>
          </div>
        </React.Fragment>
      );
    });
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
        {renderChats()}
      </div>

      {/* Display file preview */}
      {filePreview && (
        <div className="my-2">
          <p>File Selected:</p>
          <a href={filePreview} download>{filePreview}</a>
        </div>
      )}

      {/* Display image preview */}
      {imagePreview && (
        <div className="my-2">
          <p>Image Selected:</p>
          <img src={imagePreview} alt="Selected preview" className="max-w-full h-auto" />
        </div>
      )}

      <div className="flex p-4 border-t border-gray-300 bg-white">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg mr-2"
        />

        <label htmlFor="file-upload" className="cursor-pointer">
          <FontAwesomeIcon icon={faFile} size="lg" className="mr-2" />
          <input
            id="file-upload"
            type="file"
            accept="*/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <label htmlFor="image-upload" className="cursor-pointer">
          <FontAwesomeIcon icon={faImage} size="lg" className="mr-2" />
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

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
