import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Circle,
  useLoadScript,
} from "@react-google-maps/api";
// import serviceProviders from "../data/serviceProviders"; // this is the service providers data from an api or local json file, example iko apo juu
import { getDistance } from "geolib";

const containerStyle = {
  width: "100%",
  height: "600px",
};
// Default center (if user location is not available)
const defaultCenter = {
  lat: -1.2921, // Latitude for Nairobi
  lng: 36.8219,  // Longitude for Nairobi
};
// Radius to consider as "nearby" in meters (e.g., 5000m = 5km)
// This is the distance to the nearest service provider
const NEARBY_RADIUS = 6000;

function MyMap({ serviceProviders, setListData }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCj4JagRCSg_xOd8GtDUEfYaNIdZHYhDX0",
  });

  const prevNearbyProvidersRef = useRef([]);

  // Request user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude, // get users browser lat
            lng: position.coords.longitude, // get users browser lng
          };
          setUserLocation(pos);
          setMapCenter(pos);
        },
        () => {
          console.warn("Geolocation permission denied. Using default location.");
        }
      );
    } else {
      console.warn("Geolocation not supported by this browser.");
    }
  }, []);

  // Calculate distance between user and each service provider
  useEffect(() => {
    if (userLocation) {
      const updatedProviders = serviceProviders.map((provider) => {
        const distance = getDistance(userLocation, {
          latitude: provider.lat,
          longitude: provider.lng,
        }); // distance in meters
        return { ...provider, distance };
      });

       // Filter only providers within the specified radius
       const nearbyProviders = updatedProviders.filter(
        (provider) => provider.distance <= NEARBY_RADIUS
      );

       console.log("Nearby Providers: ", nearbyProviders);

       // Update the state only if nearbyProviders have changed
      if (
        JSON.stringify(nearbyProviders) !== JSON.stringify(prevNearbyProvidersRef.current)
      ) {
        prevNearbyProvidersRef.current = nearbyProviders;
        setListData(nearbyProviders);
      }
    } else {
        setListData([]);
    }
  }, [userLocation, serviceProviders, setListData]);
  // Memoize the map reference
  const onMapLoad = useCallback((map) => {
    // You can perform additional actions with the map instance if needed
  }, []);
  return (
        isLoaded && (
            <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={13}
            onLoad={onMapLoad}
        >
            {/* User's Location Marker */}
            {userLocation && window.google && window.google.maps && (
            <>
                <Marker
                position={userLocation}
                icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4285F4", // Google blue
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                }}
                />
                {/* Optional: Circle to represent nearby radius */}
                <Circle
                center={userLocation}
                radius={NEARBY_RADIUS}
                options={{
                    strokeColor: "#4285F4",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#4285F4",
                    fillOpacity: 0.1,
                }}
                />
            </>
            )}
            {/* Service Providers Markers */}
            {setListData &&
                serviceProviders.map((provider, index) => (
                    <Marker
                    key={`${provider.id || provider.providerId}-${index}`}
                    position={{ lat: provider.lat, lng: provider.lng }}
                    onClick={() => setSelectedProvider(provider)}
                    icon={{
                        url:
                            provider.distance !== null && provider.distance <= NEARBY_RADIUS
                                ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    }}
                />
            ))}
            
            {/* InfoWindow for selected provider */}
            {selectedProvider && (
            <InfoWindow
                position={{ lat: selectedProvider.lat, lng: selectedProvider.lng }}
                onCloseClick={() => setSelectedProvider(null)}
            >
                <div style={{ maxWidth: "200px" }}>
                <h3>{selectedProvider.name}</h3>
                <p>{selectedProvider.address}</p>
                {userLocation && selectedProvider.distance !== null && (
                    <p>
                    Distance:{" "}
                    {(selectedProvider.distance / 1000).toFixed(2)} km
                    </p>
                )}
                </div>
            </InfoWindow>
            )}
        </GoogleMap>  
        )
          
    );
}
export default React.memo(MyMap);