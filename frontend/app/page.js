"use client"
import React from 'react';
import { CategoryProvider, useCategoryContext } from '@/app/(routes)/search/_components/CategoryContext';
import BusinessList from './(routes)/search/[category]/BusinessList';
import Hero from './_components/Hero';
import CategoryList from './_components/CategoryList';

function Home() {
  // const { categoryId } = useCategoryContext();

  return (
    <CategoryProvider>
      <div>
        <Hero />
        <CategoryList />
        
        <BusinessList title={"Popular Business"} />
      </div>
    </CategoryProvider>
  );
}

export default Home;
