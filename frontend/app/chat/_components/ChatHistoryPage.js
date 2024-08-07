"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatComponent from './ChatComponent';
import InvoiceDisplay from '../../invoice/_components/invoiceDisplay'; // Adjust the import path as needed

function ChatHistoryPage() {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
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

  useEffect(() => {
    if (!selectedPartner) return;

    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/chats/history/${selectedPartner}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fetch error:', errorData.error);
          setError(errorData.error || 'An error occurred while fetching chat history.');
          return;
        }

        const data = await response.json();
        setChatHistory(data);

        // Fetch invoices for chats with an invoice_id
        const invoiceFetches = data
          .filter(chat => chat.invoice_id)
          .map(chat => fetchInvoice(chat.invoice_id));

        const invoices = await Promise.all(invoiceFetches);
        const chatHistoryWithInvoices = data.map(chat => ({
          ...chat,
          invoice: invoices.find(invoice => invoice && invoice.invoice_id === chat.invoice_id),
        }));

        setChatHistory(chatHistoryWithInvoices);
      } catch (error) {
        console.error('An error occurred while fetching chat history:', error);
        setError('An error occurred while fetching chat history.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [selectedPartner]);

  // const fetchInvoice = async (invoiceId) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       console.error('Fetch error:', errorData.error);
  //       return null;
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.error('An error occurred while fetching invoice:', error);
  //     return null;
  //   }
  // };

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
          <div>
            <ChatComponent userId={localStorage.getItem('user_id')} receiverId={selectedPartner} />
            {/* <div className="mt-8">
              {chatHistory.map(chat => (
                <div key={chat.chat_id}>
                  {chat.invoice && (
                    <div className="mt-4">
                      <InvoiceDisplay
                        userProfile={null} // Adjust or fetch user profile if necessary
                        serviceCost={chat.invoice.service_cost || ''} // Extract the service cost from invoice
                        existingInvoice={[chat.invoice]} // Pass the invoice array
                        isEditable={false} // Default value; adjust as needed
                        preview={true} // Default value; adjust as needed
                      />
                    </div>
                  )}
                </div>
              ))}
            </div> */}
          </div>
        ) : (
          <p>Select a user to start chatting.</p>
        )}
      </div>
    </div>
  );
}

export default ChatHistoryPage;
