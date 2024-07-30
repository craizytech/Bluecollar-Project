"use client";
import React, { createContext, useState, useContext } from 'react';

const CategoryContext = createContext();


export const CategoryProvider = ({ children }) => {
    const [categoryId, setCategoryId] = useState(null);

    return (
        <CategoryContext.Provider value={{ categoryId, setCategoryId }}>
            {children}
        </CategoryContext.Provider>
    );
};


export const useCategory = () => useContext(CategoryContext);
export default CategoryContext;
