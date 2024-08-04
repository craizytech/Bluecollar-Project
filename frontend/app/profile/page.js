import React from 'react'
import EditProfile from './_components/EditProfile'
import { Toaster } from 'sonner'
import SessionCheck from '../_components/common/SessionCheck';

function Page() {
  return (
    <div>
    <SessionCheck />
        <Toaster />
        <EditProfile />
    </div>
  )
}

export default Page;