"use client"
import React from 'react';
import CategorySideBar from './CategorySideBar';
import { CategoryProvider } from './_components/CategoryContext';

function Layout({ children }) {
    return (
        <CategoryProvider>
            <div className="grid grid-cols-1 md:grid-cols-4">
                <div className="hidden md:block">
                    {/* Side category nav bar */}
                    <CategorySideBar />
                </div>
                <div className="md:col-span-3">
                    {children}
                </div>
            </div>
        </CategoryProvider>
    );
}

export default Layout;
