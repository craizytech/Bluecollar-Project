"use client"
import React, { useEffect, useState } from 'react';
import BusinessList from '../search/[category]/BusinessList';
import Hero from '../_components/Hero';
import CategoryList from '../_components/CategoryList';
// import useGeolocation from '../hooks/useGeolocation';
import ComplaintButton from '../_components/ComplaintButton';
// import MapDisplay from '../_components/MapDisplay';

function Home() {
  const { location, setLocation } = useState([]);
  const { services, setServices } = useState({ latitude: null, longitude: null });

  const handleSearchResults = ( results, userLocation) => {
    setServices(results);
    setLocation(userLocation);
  };

  // useEffect(() => {
  //   if (location.latitude && location.longitude) {
  //     console.log('User location:', location);
  //   }
  // }, [location]);

  return (
    <div>
      <Hero/>
      {/* <MapDisplay services={services} userLocation={location}/> */}
      <CategoryList />
      <BusinessList title={"Popular Business"} />
      <ComplaintButton />
    </div>
  );
}

export default Home;
