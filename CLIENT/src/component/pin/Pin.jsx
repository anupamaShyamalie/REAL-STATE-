import { Marker, Popup } from 'react-leaflet'
import './pin.scss'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useState } from 'react'

const Pin = ({ item }) => {
  const [imageError, setImageError] = useState(false);

  // Handle multiple possible image formats
  const getImageUrl = (item) => {
    // Check if item has images array
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    // Check if item has single img property
    if (item.img) {
      return item.img;
    }
    // Check if item has image property
    if (item.image) {
      return item.image;
    }
    // Fallback to placeholder
    return '/placeholder-image.jpg';
  };

  const imageUrl = getImageUrl(item);

  // Validate coordinates properly
  const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return !isNaN(latitude) && 
           !isNaN(longitude) && 
           latitude !== 0 && 
           longitude !== 0 &&
           latitude >= -90 && 
           latitude <= 90 &&
           longitude >= -180 && 
           longitude <= 180;
  };

  // Only render marker if we have valid coordinates
  if (!item.latitude || !item.longitude || 
      !validateCoordinates(item.latitude, item.longitude)) {
    return null;
  }

  const position = [parseFloat(item.latitude), parseFloat(item.longitude)];

  return (
    <Marker position={position}>
      <Popup>
        <div className="popupContainer">
          <div className="imageContainer">
            <img 
              src={imageError ? '/placeholder-image.jpg' : imageUrl}
              alt={item.title || 'Property image'}
              onError={() => setImageError(true)}
            />
            <div className="price-badge">
              ${item.price}
            </div>
          </div>
          <div className="textContainer">
            <Link to={`/${item.id}`} className="property-title">
              {item.title}
            </Link>
            <div className="property-details">
              <span className="detail-item">
                <span className="icon">🛏️</span>
                {item.bedroom} Bedroom
              </span>
              <span className="detail-item">
                <span className="icon">🚿</span>
                {item.bathroom} Bathroom
              </span>
            </div>
            <div className="property-address">
              📍 {item.address}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

Pin.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    // Allow for multiple image property formats
    images: PropTypes.arrayOf(PropTypes.string),
    img: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
    bedroom: PropTypes.number.isRequired,
    bathroom: PropTypes.number.isRequired,
    latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired
}

export default Pin