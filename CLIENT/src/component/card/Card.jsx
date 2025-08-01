import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import './card.scss'
import { Bath, Bed, MapPinHouse, MessagesSquare, Bookmark, Trash2, Pencil } from 'lucide-react'
import { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import apiRequest from '../../lib/apiRequest'
import { useNavigate } from 'react-router-dom'

const Card = ({ item, isSavedList, onRemoveSaved, onDelete, onDeleteNotification }) => {
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
  const [removing, setRemoving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate();

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
    } catch {
      alert('Failed to update saved status.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSaved = async (e) => {
    e.stopPropagation();
    if (!currentUser) return alert('Please login.');
    setRemoving(true);
    try {
      await apiRequest.post('/users/unsave', { postId: item.id });
      if (onRemoveSaved) onRemoveSaved(item.id);
    } catch {
      alert('Failed to remove from saved list.');
    } finally {
      setRemoving(false);
    }
  }
  
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiRequest.delete(`/posts/${item.id}`);
      if (onDelete) onDelete(item.id, 'success');
      if (onDeleteNotification) onDeleteNotification('success');
      // Refresh the profile page to show updated list
      window.location.reload();
    } catch {
      if (onDelete) onDelete(item.id, 'error');
      if (onDeleteNotification) onDeleteNotification('error');
    } finally {
      setDeleting(false);
    }
  }
  
  // Add edit handler
  const handleEdit = () => {
    navigate(`/editpost/${item.id}`, { state: { post: item } });
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
              <MessagesSquare size={12} />
            </div>
            <div
              className="icon save-icon"
              style={{ cursor: loading ? 0.5 : 1 }}
              title={saved ? 'Unsave this post' : 'Save this post'}
              onClick={handleSave}
            >
              <Bookmark fill={saved ? 'red' : 'none'} color={saved ? 'red' : 'gray'} size={16} />
            </div>
            {isSavedList && (
              <div
                className="icon remove-saved-icon"
                title="Remove from Saved"
                onClick={handleRemoveSaved}
                style={{ cursor: removing ? 'not-allowed' : 'pointer', opacity: removing ? 0.5 : 1, marginLeft: 12 }}
              >
                <Trash2 size={16} color="#e74c3c" />
              </div>
            )}
            {/* Permanent delete button for user's own posts (not in saved list) */}
            {!isSavedList && currentUser && item.userId === currentUser.id && (
              <>
                <div
                  className="icon remove-saved-icon"
                  title="Edit Post"
                  onClick={handleEdit}
                  style={{ cursor: 'pointer', marginLeft: 12 }}
                >
                  <Pencil size={16} color="#2D336B" />
                </div>
                <div
                  className="icon remove-saved-icon"
                  title="Delete Post"
                  onClick={handleDelete}
                  style={{ cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.5 : 1, marginLeft: 12 }}
                >
                  <Trash2 size={16} color="#e74c3c" />
                </div>
              </>
            )}
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
    userId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
  }).isRequired,
  isSavedList: PropTypes.bool,
  onRemoveSaved: PropTypes.func,
  onDelete: PropTypes.func,
  onDeleteNotification: PropTypes.func,
}

export default Card