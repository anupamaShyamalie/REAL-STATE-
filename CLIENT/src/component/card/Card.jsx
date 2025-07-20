import { Link } from 'react-router'
import PropTypes from 'prop-types'
import './card.scss'
import { Bath, Bed, Import, MapPinHouse, MessagesSquare, Bookmark } from 'lucide-react'
import { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import apiRequest from '../../lib/apiRequest'

const Card = ({ item }) => {
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
  const { currentUser } = useContext(AuthContext)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.stopPropagation()
    if (!currentUser) return alert('Please login to save posts.')
    setLoading(true)
    try {
      if (!saved) {
        await apiRequest.post('/users/save', { postId: item.id })
        setSaved(true)
      } else {
        await apiRequest.post('/users/unsave', { postId: item.id })
        setSaved(false)
      }
    } catch (err) {
      alert('Failed to update saved status.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className='card'>
      <Link to={`/${item.id}`} className='imgContainer'>
        <img 
          src={imageUrl} 
          alt={item.title || 'Property image'}
          onError={(e) => {
            // Fallback if image fails to load
            e.target.src = '/placeholder-image.jpg';
          }}
        /> 
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <MapPinHouse size={14} />
          <span>{item.address}</span>
        </p>
        <p className="price">        
          <span className="custom-chip">${item.price}</span>
        </p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <Bed size={14} />
              <span>{item.bedroom} Bedroom</span>
            </div>
            <div className="feature">
              <Bath size={14} />
              <span>{item.bathroom} Bathroom</span>
            </div>
          </div>
          <div className="icons">
            <div className="icon">
              <Import size={12} />
            </div>
            <div className="icon">
              <MessagesSquare size={12} />
            </div>
            <div
              className="icon save-icon"
              style={{ cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
              title={saved ? 'Unsave this post' : 'Save this post'}
              onClick={handleSave}
            >
              <Bookmark fill={saved ? 'red' : 'none'} color={saved ? 'red' : 'gray'} size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Updated prop validation to handle multiple image formats
Card.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    // Allow for multiple image property formats
    images: PropTypes.arrayOf(PropTypes.string),
    img: PropTypes.string,
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
    bedroom: PropTypes.number.isRequired,
    bathroom: PropTypes.number.isRequired,
  }).isRequired
}

export default Card