"use client";
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { format, isSameDay } from 'date-fns';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter, useSearchParams } from 'next/navigation';
import InvoiceDisplay from '../../invoice/_components/invoiceDisplay';

function ChatComponent({ userId, receiverId, bookingId: propBookingId }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [receiverProfilePicture, setReceiverProfilePicture] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdFromUrl = searchParams.get('bookingId');
  const invoiceId = searchParams.get('invoiceId');

  useEffect(() => {
    const bookingId = propBookingId || bookingIdFromUrl;

    if (!userId || !receiverId) {
      console.error('User ID or Receiver ID is missing');
      return;
    }

    if (bookingId) {
      console.log('Using Booking ID:', bookingId);
    } else {
      console.error('Booking ID is missing');
    }

    const fetchChatHistory = async () => {
      setLoading(true);
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

    if (invoiceId) {
      fetchInvoice(invoiceId);
    }

  }, [propBookingId, userId, receiverId, invoiceId, bookingIdFromUrl]);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const profileData = await response.json();
      console.log('Fetched user profile data:', profileData);
      setUserProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };
  
  const fetchInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const invoiceData = await response.json();
      console.log('Fetched invoice data:', invoiceData);

      setInvoice(invoiceData[0] || null);

      // Fetch user profile if userId is available in the invoice
      if (invoiceData[0]?.user_id) {
        fetchUserProfile(invoiceData[0].user_id);
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    }
  };

  const handleSendMessage = async (content, file = null) => {
    const messageContent = content.trim();

    if (!messageContent && !file) {
      console.error('Message content is empty and no file is provided');
      return;
    }

    if (!receiverId) {
      console.error('Receiver ID is missing');
      return;
    }

    setSending(true);

    const formData = new FormData();
    formData.append('receiver_id', receiverId);
    formData.append('message', messageContent);
    if (file) {
      formData.append('file', file);
    }

    try {
      console.log('Sending message with file:', { receiver_id: receiverId, message: messageContent, file });

      const response = await fetch('http://localhost:5000/api/chats/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Send message error:', errorData.error);
        setError(errorData.error || 'An error occurred while sending the message.');
        return;
      }

      const newChat = await response.json();
      console.log('Message sent successfully:', newChat);
      setChats((prevChats) => [...prevChats, newChat]);
      setMessage(''); // Clear message input if it's used
      if (file) setInvoice(null); // Clear invoice if it's sent as a file
    } catch (error) {
      console.error('An error occurred while sending the message:', error);
      setError('An error occurred while sending the message.');
    } finally {
      setSending(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) {
      console.error('No invoice to send');
      return;
    }

    try {
      // Convert invoice to a JSON file
      const invoiceBlob = new Blob([JSON.stringify(invoice)], { type: 'application/json' });
      const invoiceFile = new File([invoiceBlob], `invoice_${invoice.invoice_id}.json`, { type: 'application/json' });

      console.log('Sending invoice file:', invoiceFile);
      await handleSendMessage('', invoiceFile);
      console.log('Invoice sent successfully');
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const handleCreateInvoice = () => {
    console.log('Create invoice for booking ID:', propBookingId);

    const bookingId = propBookingId || bookingIdFromUrl;

    if (bookingId) {
      router.push(`/invoice?bookingId=${bookingId}&receiverId=${receiverId}`);
    } else {
      setError('Choose a booking from the accepted bookings to create an Invoice');
      console.error('Booking ID is missing for invoice creation');
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
        {invoice && (
          <div className="invoice-preview p-4 mt-4 bg-white shadow-md rounded-lg border border-gray-300">
            <InvoiceDisplay
              userProfile={userProfile}
              serviceCost={invoice.service_cost || ''} // Extract the service cost from invoice
              existingInvoice={invoice ? [invoice] : []}
              isEditable={false} // Default value; adjust as needed
              preview={true} // Default value; adjust as needed
            />
            <button
              onClick={handleSendInvoice}
              disabled={sending}
              className={`p-2 px-4 mt-4 rounded-lg ${sending ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              {sending ? 'Sending Invoice...' : 'Send Invoice'}
            </button>
          </div>
        )}
      </div>

      {/* Attachment Modal */}
      <Dialog.Root open={attachmentModalOpen} onOpenChange={setAttachmentModalOpen}>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-2">Attachments</Dialog.Title>
          <ul className="list-none p-0 m-0">
            <button 
              className="p-2 px-4 mr-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCreateInvoice}
            >
              <FontAwesomeIcon icon={faFile} />
            </button>
            <p>Invoice</p>
          </ul>
          <button onClick={() => setAttachmentModalOpen(false)} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg">
            Close
          </button>
        </Dialog.Content>
      </Dialog.Root>

      <div className="flex p-4 border-t border-gray-300 bg-white">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg mr-2"
        />
        
        {/* File icon for opening the attachment modal */}
        <button
          onClick={() => setAttachmentModalOpen(true)}
          className="p-2 px-4 mr-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
        >
          <FontAwesomeIcon icon={faPaperclip} size="lg" />
        </button>

        <button
          onClick={() => handleSendMessage(message)}
          disabled={sending}
          className={`p-2 px-4 rounded-lg ${sending ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ChatComponent;
