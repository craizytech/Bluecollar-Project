"use client";
import React from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  CircleUser,
  Menu,
  Package2,
  Search,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

function Header() {
  const pathname = usePathname();

  const isActive = (href) => {
    return pathname === href ? 'text-black' : 'text-muted-foreground';
  };

  return (
    <header className="sticky top-0 flex h-16 z-50 bg-transparent items-center gap-4 border-b px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <NavLink href="/admin/dashboard" className={`transition-colors hover:text-foreground ${isActive('/admin/dashboard')}`}>
          Dashboard
        </NavLink>
        <NavLink href="/admin/users" className={`transition-colors hover:text-foreground ${isActive('/admin/users')}`}>
          Users
        </NavLink>
        <NavLink href="/admin/categories" className={`transition-colors hover:text-foreground ${isActive('/admin/categories')}`}>
          Categories
        </NavLink>
        <NavLink href="/admin/transactions" className={`transition-colors hover:text-foreground ${isActive('/admin/transactions')}`}>
          Transactions
        </NavLink>
        <NavLink href="/admin/applications" className={`transition-colors hover:text-foreground ${isActive('/admin/applications')}`}>
          Applications
        </NavLink>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            <NavLink href="/dashboard" className={`hover:text-foreground ${isActive('/dashboard')}`}>
              Dashboard
            </NavLink>
            <NavLink href="/users" className={`text-muted-foreground hover:text-foreground ${isActive('/users')}`}>
              Users
            </NavLink>
            <NavLink href="/categories" className={`text-muted-foreground hover:text-foreground ${isActive('/categories')}`}>
              Categories
            </NavLink>
            <NavLink href="/transactions" className={`text-muted-foreground hover:text-foreground ${isActive('/transactions')}`}>
              Transactions
            </NavLink>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function NavLink({ href, className, children }) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default Header;
