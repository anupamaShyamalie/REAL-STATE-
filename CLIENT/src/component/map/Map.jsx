import { MapContainer, TileLayer } from 'react-leaflet'
import './map.scss'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import Pin from '../pin/Pin'
import PropTypes from 'prop-types'

// Fix default icon paths
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})



const Map = ({items}) => {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <MapContainer center={[7.2906, 80.6337]} zoom={13} scrollWheelZoom={false} className='map'>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />  

{safeItems.map(item=>(
  <Pin item={item} key={item.id} />
))
}  </MapContainer>
  )
}

// Add prop validation
Map.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      img: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      address: PropTypes.string.isRequired,
      bedroom: PropTypes.number.isRequired,
      bathroom: PropTypes.number.isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    })
  ).isRequired
}


export default Map