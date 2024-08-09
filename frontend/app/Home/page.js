"use client"
import React, { useEffect } from 'react';
import BusinessList from '../search/[category]/BusinessList';
import Hero from '../_components/Hero';
import CategoryList from '../_components/CategoryList';
import useGeolocation from '../hooks/useGeolocation';
import ComplaintButton from '../_components/ComplaintButton';

function Home() {
  const { location, error } = useGeolocation();

  useEffect(() => {
    if (location.latitude && location.longitude) {
      console.log('User location:', location);
    }
  }, [location]);

  return (
    <div>
      <Hero />
      <CategoryList />
      <BusinessList title={"Popular Business"} />
      <ComplaintButton />
    </div>
  );
}

export default Home;
