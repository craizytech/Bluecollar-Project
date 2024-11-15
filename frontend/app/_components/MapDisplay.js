// MapDisplay.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom marker icon (default Leaflet marker might not appear correctly)
const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

function MapDisplay({ services, userLocation }) {
  // Add an additional check to ensure userLocation is defined
  if (!userLocation || userLocation.latitude === null || userLocation.longitude === null) {
    return <p>Loading map...</p>; // Or any other loading indicator
  }

  return (
    <MapContainer
      center={[userLocation.latitude, userLocation.longitude]}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* User Location Marker */}
      <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Service Provider Markers */}
      {services.map((service, index) => (
        <Marker
          key={index}
          position={[
            parseFloat(service.provider_location.split(',')[0]),
            parseFloat(service.provider_location.split(',')[1])
          ]}
          icon={userIcon}
        >
          <Popup>
            <strong>{service.service_name}</strong>
            <br />
            {service.service_description}
            <br />
            Location: {service.provider_location}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapDisplay;
