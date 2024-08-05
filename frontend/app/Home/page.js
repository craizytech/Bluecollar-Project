"use client"
import React, { useEffect } from 'react';
import BusinessList from '../search/[category]/BusinessList';
import Hero from '../_components/Hero';
import CategoryList from '../_components/CategoryList';
import useGeolocation from '../hooks/useGoelocation';
import SessionCheck from '../_components/common/SessionCheck';

function Home() {
  const { location, error } = useGeolocation();

  useEffect(() => {
    if (location.latitude && location.longitude) {
      // Perform actions with the location data
      console.log('User location:', location);
      // Example: fetch data based on location
      // fetchDataBasedOnLocation(location.latitude, location.longitude);
    }
  }, [location]);

  return (
    <div>
    <SessionCheck />
      <Hero />
      <CategoryList />
      <BusinessList title={"Popular Business"} />
    </div>
  );
}

export default Home;
