import React from 'react'
import ChatHistoryPage from './_components/ChatHistoryPage'
import { Toaster } from 'sonner'

function page() {
  return (
    <div>
    <Toaster />
        <ChatHistoryPage />
    </div>
  )
}

export default page