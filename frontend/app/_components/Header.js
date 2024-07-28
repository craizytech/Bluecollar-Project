"use client";

import React, { useContext } from 'react'

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthContext from './forms/AuthContext';
import {
    CreditCard,
    LogOut,
    Settings,
    User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function Header() {
    const pathname = usePathname();
    const { authState, logout } = useContext(AuthContext);

    const isActive = (href) => {
        return pathname === href ? 'text-blue-500' : 'text-black';
    };

    return (
        <div className="p-5 shadow-sm flex justify-between">
            <div className="flex items-center gap-8">
                <Image src='/logo.svg' alt='logo' width={180} height={100} />
                <div className="md:flex items-center gap-6 hidden">
                    <Link href="/" className={`hover:scale-105 hover:text-blue-500 hover:cursor-pointer ${isActive('/')}`}>Home</Link>
                    <Link href="/about" className={`hover:scale-105 hover:text-blue-500 hover:cursor-pointer ${isActive('/about')}`}>About Us</Link>
                    <Link href="/services" className={`hover:scale-105 hover:text-blue-500 hover:cursor-pointer ${isActive('/services')}`}>Services</Link>
                </div>
            </div>
            <div>
                {authState.token ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Account</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <Link href="/users" className="flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>Billing</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <button onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                                </button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link className="bg-primary hover:bg-blue-600 rounded-lg py-2 px-4 text-white" href="/login">Login/Sign Up</Link>
                )}
            </div>
        </div >
    );
}

export default Header;
