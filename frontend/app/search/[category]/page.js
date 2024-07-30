import React from 'react'
import BusinessByCategory from './BusinessByCategory'

function page({ params }) {
  const categoryId = params.category
  return (
    <BusinessByCategory categoryId={categoryId}/>
  )
}

export default page