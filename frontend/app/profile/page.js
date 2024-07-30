import React from 'react'
import EditProfile from './_components/EditProfile'
import { Toaster } from 'sonner'

function Page() {
  return (
    <div>
        <Toaster />
        <EditProfile />
    </div>
  )
}

export default Page;