import Slider from '../../component/slider/Slider'
import './singlePage.scss'
import { singlePostData, userData } from "../../lib/dummydata"
import { BedDouble, Bus, Dog, HandCoins, MapPinHouse, MapPinPlus, MessageCircle, Ruler, School, ShowerHead, Soup, Wrench } from 'lucide-react'
import Map from '../../component/map/Map'
import { Link } from 'react-router'

// ✅ CORRECT


const SinglePage = () => {
  return (
    <div className='singlePage'>
      <div className="details">
        <div className="wrapper">
          <Slider images={singlePostData.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h4>{singlePostData.title}</h4>
                <div className="address">
                  <MapPinHouse size={14} />
                  <span>{singlePostData.address}</span>
                </div>
                <div className="price"> <span className='custom-chip'>$ {singlePostData.price}</span> </div>
              </div>
              <div className="user">
                <Link to={'/profile'}>
                <img src={userData.img} alt="" />
                </Link>
                <span>{userData.name}</span>
               
              </div>
            </div>
            <div className="bottom">
              {singlePostData.description}
            </div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
                <Wrench size={18} style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}}/>
              <div className="featureText">
                <span>Utilities</span>
                <p>Renter is responsible</p>
              </div>
            </div>
            <div className="feature">
            <Dog size={18} style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}}/>
              <div className="featureText">
                <span>Pet Policy</span>
                <p>Pets Allowed</p>
              </div>
            </div>
            <div className="feature">
              <HandCoins size={18} style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}} />
              <div className="featureText">
                <span>Property Fees</span>
                <p>Must have 3x the rent in total household incomes</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
            <Ruler size={18} style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}}/>
              <span>80 sqft</span>
            </div>
            <div className="size">
            <BedDouble size={18} style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}}/>
              <span>2 beds</span>
            </div>
            <div className="size">
            <ShowerHead  size={18}style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}}/>
              <span>1 bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
            <School  size={18}style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}}/>
              <div className="featureText">
                <span>School</span>
                <p>250m away</p>
              </div>
            </div>
            <div className="feature">
            <Bus  size={18} style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}} />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>100m away</p>
              </div>
            </div>
            <div className="feature">
            <Soup size={18} style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}} />
              <div className="featureText">
                <span>Restaurant</span>
                <p>200m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={singlePostData} />
          </div>
          <div className="buttons">
            <div className="button">
              <MessageCircle  size={18} style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}} />
              Send a Message
            </div>
            <div className="button">
              <MapPinPlus size={18} style={{backgroundColor:"#2D336B",padding:"3px",borderRadius:'50%',color:"white"}} />
              Save Location
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SinglePage