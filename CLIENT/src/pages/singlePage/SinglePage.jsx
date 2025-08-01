import Slider from '../../component/slider/Slider'
import './singlePage.scss'
import { 
  BedDouble, 
  Bus, 
  Dog, 
  HandCoins, 
  MapPin, 
  MessageCircle, 
  Ruler, 
  School, 
  ShowerHead, 
  Soup, 
  Wrench,
  Heart,
  Share2,
  Phone,
  Calendar,
  Star
} from 'lucide-react'
import Map from '../../component/map/Map'
import { Link, useLoaderData } from 'react-router-dom'

const SinglePage = () => {
  const posts = useLoaderData()
  
  return (
    <div className='singlePage'>
      <div className="singlePage-container">
        {/* Main Content Section */}
        <div className="main-content">
          <div className="property-gallery">
            <Slider images={posts.images} />
          </div>
          
          <div className="property-info">
            <div className="property-header">
              <div className="property-title-section">
                <h1 className="property-title">{posts.title}</h1>
                <div className="property-location">
                  <MapPin className="location-icon" />
                  <span>{posts.address}</span>
                </div>
                <div className="property-price">
                  <span className="price-amount">${posts.price.toLocaleString()}</span>
                  <span className="price-period">/month</span>
                </div>
              </div>
              
              <div className="property-actions">
                <button className="action-btn favorite-btn" title="Add to favorites">
                  <Heart className="action-icon" />
                </button>
                <button className="action-btn share-btn" title="Share property">
                  <Share2 className="action-icon" />
                </button>
                <button className="action-btn contact-btn" title="Contact agent">
                  <Phone className="action-icon" />
                </button>
              </div>
            </div>

            <div className="property-stats">
              <div className="stat-item">
                <BedDouble className="stat-icon" />
                <span className="stat-value">{posts.bedroom}</span>
                <span className="stat-label">Bedrooms</span>
              </div>
              <div className="stat-item">
                <ShowerHead className="stat-icon" />
                <span className="stat-value">{posts.bathroom}</span>
                <span className="stat-label">Bathrooms</span>
              </div>
              <div className="stat-item">
                <Ruler className="stat-icon" />
                <span className="stat-value">{posts.postDetails.size}</span>
                <span className="stat-label">Sq Ft</span>
              </div>
              <div className="stat-item">
                <Calendar className="stat-icon" />
                <span className="stat-value">Available</span>
                <span className="stat-label">Now</span>
              </div>
            </div>

            <div className="property-description">
              <h3 className="section-title">Description</h3>
              <p className="description-text">{posts.postDetails.desc}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="sidebar">
          <div className="agent-card">
            <div className="agent-info">
              {posts.user.avatar ? (
                <img 
                  src={posts.user.avatar} 
                  alt={posts.user.username}
                  className="agent-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="agent-avatar"
                style={{ display: posts.user.avatar ? 'none' : 'flex' }}
                data-initial={posts.user.username.charAt(0).toUpperCase()}
              >
                {posts.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="agent-details">
                <h4 className="agent-name">{posts.user.username}</h4>
                <div className="agent-rating">
                  <Star className="star-icon" />
                  <span className="rating-text">Verified Agent</span>
                </div>
              </div>
            </div>
            <div className="agent-actions">
              <button className="btn-primary">
                <MessageCircle className="btn-icon" />
                Send Message
              </button>
              <button className="btn-outline">
                <Phone className="btn-icon" />
                Call Now
              </button>
            </div>
          </div>

          <div className="property-features">
            <h3 className="section-title">Property Features</h3>
            
            <div className="features-section">
              <h4 className="subsection-title">General</h4>
              <div className="features-grid">
                <div className="feature-item">
                  <Wrench className="feature-icon" />
                  <div className="feature-content">
                    <span className="feature-label">Utilities</span>
                    <p className="feature-value">{posts.postDetails.utilities}</p>
                  </div>
                </div>
                <div className="feature-item">
                  <Dog className="feature-icon" />
                  <div className="feature-content">
                    <span className="feature-label">Pet Policy</span>
                    <p className="feature-value">{posts.postDetails.pet}</p>
                  </div>
                </div>
                <div className="feature-item">
                  <HandCoins className="feature-icon" />
                  <div className="feature-content">
                    <span className="feature-label">Property Fees</span>
                    <p className="feature-value">${posts.postDetails.income} monthly minimum</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="features-section">
              <h4 className="subsection-title">Nearby Places</h4>
              <div className="features-grid">
                <div className="feature-item">
                  <School className="feature-icon" />
                  <div className="feature-content">
                    <span className="feature-label">School</span>
                    <p className="feature-value">{posts.postDetails.school}km away</p>
                  </div>
                </div>
                <div className="feature-item">
                  <Bus className="feature-icon" />
                  <div className="feature-content">
                    <span className="feature-label">Bus Stop</span>
                    <p className="feature-value">{posts.postDetails.bus}km away</p>
                  </div>
                </div>
                <div className="feature-item">
                  <Soup className="feature-icon" />
                  <div className="feature-content">
                    <span className="feature-label">Restaurant</span>
                    <p className="feature-value">{posts.postDetails.restaurant}km away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="location-section">
            <h3 className="section-title">Location</h3>
            <div className="map-container">
              <Map items={[posts]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SinglePage