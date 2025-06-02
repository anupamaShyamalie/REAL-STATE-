import { Marker, Popup } from 'react-leaflet'
import './pin.scss'
import { Link } from 'react-router'
import PropTypes from 'prop-types'

const Pin = ({item}) => {
  return (
   <Marker position={[item.latitude,item.longitude]}>
        <Popup>
            <div className="popupContainer">
              <img src={item.img} />  
              <div className="textContainer">
                <Link to={`/${item.id}`}>{item.title}</Link>
                <span className="bed">{item.bedroom} Bedroom</span>
                <b>${item.price}</b>
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
    latitude: PropTypes.oneOfType([
      PropTypes.number,
    ]).isRequired,
    longitude: PropTypes.oneOfType([
      PropTypes.number,
    ]).isRequired,
    // For example:
    // title: PropTypes.string,
    // price: PropTypes.number,
    // location: PropTypes.string,
    // etc.
  }).isRequired
}

export default Pin