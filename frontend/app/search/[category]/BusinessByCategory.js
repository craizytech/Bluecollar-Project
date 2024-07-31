"use client"
import React, { useEffect, useState } from 'react';
import { useCategory } from '@/app/context/CategoryContext';
import BusinessList from '@/app/search/[category]/BusinessList';

function BusinessByCategory({ categoryId: initialCategoryId}) {
  const { setCategoryId } = useCategory();
  
  useEffect(() => {
        if (initialCategoryId) {
            setCategoryId(initialCategoryId);
        }
    }, [initialCategoryId, setCategoryId]);

    return (
        <div>
           {initialCategoryId && (
              <BusinessList title={`Services in Category ${initialCategoryId}`} categoryId={initialCategoryId} />
            )}
        </div>
    );
}

export default BusinessByCategory;

