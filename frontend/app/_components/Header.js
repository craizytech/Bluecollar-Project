import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

function Header() {
    return (
        <div className="p-5 shadow-sm flex justify-between">
            <div className="flex items-center gap-8">
                <Image src='/logo.svg' alt='logo'
                    width={180} height={100} />
                <div className="md:flex items-center gap-6 hidden">
                    <h2 className="hover:scale-105 hover:text-primary hover:cursor-pointer">Home</h2>
                    <h2 className="hover:scale-105 hover:text-primary hover:cursor-pointer">About Us</h2>
                    <h2 className="hover:scale-105 hover:text-primary hover:cursor-pointer">Services</h2>
                </div>
            </div>
            <div>
                <Button>Login/Sign Up</Button>
            </div>
        </div>
    )
}

export default Header