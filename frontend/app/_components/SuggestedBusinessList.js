import { Button } from '@/components/ui/button'
import { NotebookPen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import BookingSection from './BookingSection'


function SuggestedBusinessList() {
  return (
    <div className='md:pl-10'>
      <BookingSection>
        <Button className="flex gap-2 w-full">
          <NotebookPen/>
          Book Appointment
        </Button>
      </BookingSection>
      <div className='hidden md:block'>
      <h2 className='font-bold text-lg mt-3 mb-3
      '>Similar Business</h2>
      <div>
        <Link href={''} className='flex gap-2 mb-4
        hover:border rounded-lg p-2
        cursor-pointer hover:shadow-md
        border-primary'>
          <Image src={''}
            alt='image'
            width={80}
            height={80}
            className='rounded-lg object-cover'
          />
          <div>
            <h2 className='font-bold'>Business Name</h2>
            <h2 className='text-primary'>Business Contact Person</h2>
            <h2 className='text-gray-400'>Business Name</h2>
          </div>
        </Link>
      </div>
      </div>
    </div>
  )
}

export default SuggestedBusinessList