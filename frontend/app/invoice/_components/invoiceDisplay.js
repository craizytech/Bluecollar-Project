import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

function InvoiceDisplay({
  userProfile,
  serviceCost,
  existingInvoice,
  handleSubmit,
  handleDelete,
  handleSendInvoice,
  setServiceCost,
  error,
  success,
  isEditable = true,  // For sender (editable) and receiver (read-only)
  preview = false,
}) {

  const invoice = existingInvoice || {};
  const extractedServiceCost = serviceCost || invoice.service_cost || '';

  const formattedDate = existingInvoice?.date
  ? format(new Date(existingInvoice.date), 'dd/MM/yyyy')
  : format(new Date(), 'dd/MM/yyyy');


  return (
    <div className="max-w-2xl mx-auto bg-gray-100 p-8 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <Image src="/logo.png" alt="logo" width={100} height={100} />
        <div>
          <p className="font-bold text-lg">Invoice Date: {formattedDate}</p>
        </div>
      </div>
      <div>
        <input
          type="text"
          className="w-full bg-inherit p-2 text-blue-700 font-bold text-3xl"
          value="BlueCollar"
          readOnly
        />
      </div>
      <h2 className="text-2xl text-center font-bold mb-6">
        {preview ? 'Invoice' : existingInvoice ? 'Update Invoice' : 'Create Invoice'}
      </h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">From</label>
            <textarea
              className="w-full p-2 border bg-inherit border-gray-300 rounded mb-2"
              value={
                userProfile
                  ? `Name: ${userProfile.user_name}\nEmail: ${userProfile.user_email}\nPhone: ${userProfile.user_phone_number}\nLocation: ${userProfile.user_location}`
                  : 'Loading...'
              }
              readOnly
              style={{ resize: 'none', overflow: 'hidden', fontSize: 'small' }}
              rows={
                userProfile
                  ? (userProfile.user_name ? 1 : 0) +
                    (userProfile.user_email ? 1 : 0) +
                    (userProfile.user_phone_number ? 1 : 0) +
                    (userProfile.user_location ? 1 : 0)
                  : 4
              }
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Cost (KES)</label>
          <input
            type="number"
            className="w-full p-2 border bg-inherit border-gray-300 rounded"
            value={extractedServiceCost}
            onChange={(e) => setServiceCost(e.target.value)}
            required
            disabled={preview}
          />
        </div>
        {!preview && isEditable && (
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {existingInvoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
            {existingInvoice && (
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete Invoice
              </button>
            )}
          </div>
        )}
      </form>
      {!preview && existingInvoice && isEditable && (
        <button
          onClick={handleSendInvoice}
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Send Invoice
        </button>
      )}
    </div>
  );
}

export default InvoiceDisplay;
