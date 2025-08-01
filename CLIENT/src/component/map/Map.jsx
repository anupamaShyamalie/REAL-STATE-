import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import './map.scss'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import Pin from '../pin/Pin'
import PropTypes from 'prop-types'
import { useEffect, useState, useRef } from 'react'

// Fix default icon paths
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const Map = ({ items }) => {
  const [mapKey, setMapKey] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const safeItems = Array.isArray(items) ? items : [];

  // Re-render map when items change to fix index issues
  useEffect(() => {
    setMapKey(prev => prev + 1);
    setMapLoaded(false);
  }, [items]);

  // Calculate bounds for all valid properties
  const getMapBounds = () => {
    const validItems = safeItems.filter(item => 
      item.latitude && 
      item.longitude && 
      !isNaN(parseFloat(item.latitude)) && 
      !isNaN(parseFloat(item.longitude)) &&
      parseFloat(item.latitude) !== 0 &&
      parseFloat(item.longitude) !== 0
    );

    if (validItems.length === 0) {
      return null; // Use default center
    }

    const lats = validItems.map(item => parseFloat(item.latitude));
    const lngs = validItems.map(item => parseFloat(item.longitude));

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return [
      [minLat, minLng],
      [maxLat, maxLng]
    ];
  };

  // Calculate center based on items or use default
  const getMapCenter = () => {
    if (safeItems.length === 0) {
      return [7.2906, 80.6337]; // Default center
    }

    const validItems = safeItems.filter(item => 
      item.latitude && 
      item.longitude && 
      !isNaN(parseFloat(item.latitude)) && 
      !isNaN(parseFloat(item.longitude)) &&
      parseFloat(item.latitude) !== 0 &&
      parseFloat(item.longitude) !== 0
    );

    if (validItems.length === 0) {
      return [7.2906, 80.6337]; // Default center
    }

    const totalLat = validItems.reduce((sum, item) => sum + parseFloat(item.latitude), 0);
    const totalLng = validItems.reduce((sum, item) => sum + parseFloat(item.longitude), 0);
    
    const centerLat = totalLat / validItems.length;
    const centerLng = totalLng / validItems.length;

    // Validate the calculated center
    if (isNaN(centerLat) || isNaN(centerLng) || 
        centerLat === 0 || centerLng === 0) {
      return [7.2906, 80.6337]; // Default center
    }

    return [centerLat, centerLng];
  };

  const center = getMapCenter();
  const bounds = getMapBounds();

  // Validate center coordinates before rendering map
  if (isNaN(center[0]) || isNaN(center[1]) || 
      center[0] === 0 || center[1] === 0) {
    return (
      <div className="map-container">
        <div className="map-header">
          <h3>Property Locations</h3>
          <span className="property-count">
            {safeItems.length} {safeItems.length === 1 ? 'property' : 'properties'} on map
          </span>
        </div>
        <div className="map-error">
          <p>Unable to load map due to invalid coordinates.</p>
          <p>Please check property location data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-header">
        <h3>Property Locations</h3>
        <span className="property-count">
          {safeItems.length} {safeItems.length === 1 ? 'property' : 'properties'} on map
        </span>
      </div>
      
      <div className="map-wrapper">
        {!mapLoaded && (
          <div className="map-loading">
            <p>Loading map...</p>
          </div>
        )}
        
        <MapContainer 
          ref={mapRef}
          key={mapKey}
          center={center} 
          zoom={bounds ? 4 : 6} 
          scrollWheelZoom={true}
          className='map'
          zoomControl={true}
          style={{ 
            height: '100%', 
            width: '100%',
            minHeight: '400px',
            position: 'relative'
          }}
          whenCreated={(map) => {
            setMapLoaded(true);
            mapRef.current = map;
            
            // Fit bounds if we have valid bounds
            if (bounds) {
              try {
                map.fitBounds(bounds, {
                  padding: [20, 20],
                  maxZoom: 8
                });
              } catch (error) {
                console.error('Error fitting bounds:', error);
              }
            }
            
            // Force map to invalidate size after creation
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            eventHandlers={{
              load: () => {
                setMapLoaded(true);
                if (mapRef.current) {
                  mapRef.current.invalidateSize();
                }
              },
              error: () => console.error('Map tile loading error')
            }}
          />
          
          {safeItems.map((item, index) => (
            <Pin 
              item={item} 
              key={`${item.id}-${index}`} 
            />
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

// Add prop validation
Map.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      img: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      address: PropTypes.string.isRequired,
      bedroom: PropTypes.number.isRequired,
      bathroom: PropTypes.number.isRequired,
      latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ).isRequired
}

export default Map