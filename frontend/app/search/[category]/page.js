"use client"
import { useCategoryContext } from '../_components/CategoryContext';
import React, { useEffect, useState } from 'react';
import BusinessList from '@/app/(routes)/search/[category]/BusinessList';

function BusinessByCategory() {
  const { categoryId } = useCategoryContext();

    return (
        <div>
           {categoryId && (
              <BusinessList title={`Services in Category ${categoryId}`} categoryId={categoryId} />
            )}
        </div>
    );
}

export default BusinessByCategory;

