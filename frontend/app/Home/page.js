"use client"
import React, { useEffect, useState } from 'react';
import BusinessList from '../search/[category]/BusinessList';
import Hero from '../_components/Hero';
import CategoryList from '../_components/CategoryList';
import useGeolocation from '../hooks/useGeolocation';
import ComplaintButton from '../_components/ComplaintButton';

function Home() {
  const { location, error } = useGeolocation();
  const [listData, setListData] = useState([]);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      console.log('User location:', location);
    }
  }, [location, error]);

  return (
    <div>
      <CategoryList />
      <Hero listData={listData} setListData={setListData} />
      {/* <BusinessList title={"Popular Businesses"} /> */}
      <ComplaintButton />
    </div>
  );
}

export default Home;
