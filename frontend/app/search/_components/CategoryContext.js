import React, { createContext, useState, useContext } from 'react';

const CategoryContext = createContext();

export const useCategoryContext = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
    const [categoryId, setCategoryId] = useState(null);

    const handleCategorySelect = (selectedCategoryId) => {
        console.log(`Selected category ID: ${selectedCategoryId}`);
        setCategoryId(selectedCategoryId);
    };

    return (
        <CategoryContext.Provider value={{ categoryId, handleCategorySelect }}>
            {children}
        </CategoryContext.Provider>
    );
};
