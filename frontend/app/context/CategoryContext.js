"use client"
import React, { createContext, useContext, useState } from 'react';

const CategoryContext = createContext();

export function useCategory() {
    return useContext(CategoryContext);
}

export function CategoryProvider({ children }) {
    const [categoryId, setCategoryId] = useState(null);

    return (
        <CategoryContext.Provider value={{ categoryId, setCategoryId }}>
            {children}
        </CategoryContext.Provider>
    );
}

export { CategoryContext };