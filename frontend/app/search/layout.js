"use client"
import React, { useState } from 'react';
import CategorySideBar from './CategorySideBar';
import { CategoryProvider } from '../context/CategoryContext';

function Layout({ children }) {
    const [categoryId, setCategoryId] = useState(null);
    return (
        <CategoryProvider>
        <div className="grid grid-cols-1 md:grid-cols-4">
                <div className="hidden md:block">
                    {/* Side category nav bar */}
                    <CategorySideBar setCategoryId={setCategoryId}/>
                </div>
                <div className="md:col-span-3">
                    {children}
                </div>
            </div>
        </CategoryProvider>
            
    );
}

export default Layout;
