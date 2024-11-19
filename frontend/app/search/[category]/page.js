"use client";
import React from 'react'
import { useSelector } from 'react-redux';
import BusinessByCategory from './BusinessByCategory'

function page() {
  const categoryId = useSelector(state => state.category.categoryId);

  return (
    <BusinessByCategory categoryId={categoryId}/>
  )
}

export default page