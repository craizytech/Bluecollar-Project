import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Header() {
    return (
        <div className="p-5 shadow-sm flex justify-between">
            <div className="flex items-center gap-8">
                <Image src='/logo.svg' alt='logo'
                    width={180} height={100} />
                <div className="md:flex items-center gap-6 hidden">
                    <Link href="/" className="hover:scale-105 hover:text-primary hover:cursor-pointer">Home</Link>
                    <h2 className="hover:scale-105 hover:text-primary hover:cursor-pointer">About Us</h2>
                    <h2 className="hover:scale-105 hover:text-primary hover:cursor-pointer">Services</h2>
                </div>
            </div>
            <div>
                <Link className="bg-primary hover:bg-blue-600 rounded-lg py-2 px-4 text-white" href="/login">Login/Sign Up</Link>
            </div>
        </div>
    )
}

export default Header