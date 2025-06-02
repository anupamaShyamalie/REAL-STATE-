import { Link } from 'react-router'
import PropTypes from 'prop-types'
import './card.scss'
import { Bath, Bed, Import, MapPinHouse, MessagesSquare } from 'lucide-react'



const Card = ({ item }) => {
  return (
    <div className='card'>
      <Link to={`/${item.id}`} className='imgContainer'>
        <img src={item.img} alt="" />
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
              <span>{item.bedroom} Bedroom </span>
            </div>
            <div className="feature">
              <Bath size={14} />
              <span>{item.bathroom} Bathroom </span>
            </div>
          </div>
          <div className="icons">
            <div className="icon">
              <Import size={12} />
            </div>
            <div className="icon">
              <MessagesSquare size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add prop validation
Card.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    img: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    title: PropTypes.oneOfType([
      PropTypes.string,
    ]).isRequired,
    // Add other item properties as needed
    price: PropTypes.oneOfType([
      PropTypes.number,
    ]).isRequired,
    address: PropTypes.oneOfType([
      PropTypes.string,
    ]).isRequired,
    bedroom: PropTypes.oneOfType([
      PropTypes.number,
    ]).isRequired,
    bathroom: PropTypes.oneOfType([
      PropTypes.number,
    ]).isRequired,
    // For example:
    // title: PropTypes.string,
    // price: PropTypes.number,
    // location: PropTypes.string,
    // etc.
  }).isRequired
}

export default Card