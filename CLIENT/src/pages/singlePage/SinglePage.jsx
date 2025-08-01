import Slider from '../../component/slider/Slider'
import './singlePage.scss'
import { BedDouble, Bus, Dog, HandCoins, MapPinHouse, MapPinPlus, MessageCircle, Ruler, School, ShowerHead, Soup, Wrench } from 'lucide-react'
import Map from '../../component/map/Map'
import { Link, useLoaderData } from 'react-router-dom'

const SinglePage = () => {
  const posts = useLoaderData()
  console.log(posts)
  
  return (
    <div className='singlePage'>
      <div className="details">
        <div className="wrapper">
          <Slider images={posts.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h4>{posts.title}</h4>
                <div className="address">
                  <MapPinHouse size={14} />
                  <span>{posts.address}</span>
                </div>
                <div className="price"> <span className='custom-chip'>$ {posts.price}</span> </div>
              </div>
              <div className="user">
                <Link to={'/profile'}>
                  <img src={posts.user.avatar || '/default-avatar.png'} alt="" />
                </Link>
                <span>{posts.user.username}</span>
              </div>
            </div>
            <div className="bottom">
              {posts.postDetails.desc}
            </div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <Wrench size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              <div className="featureText">
                <span>Utilities</span>
                <p>{posts.postDetails.utilities}</p>
              </div>
            </div>
            <div className="feature">
              <Dog size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              <div className="featureText">
                <span>Pet Policy</span>
                <p>{posts.postDetails.pet}</p>
              </div>
            </div>
            <div className="feature">
              <HandCoins size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              <div className="featureText">
                <span>Property Fees</span>
                <p>{posts.postDetails.income} monthly minimum</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <Ruler size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              <span>{posts.postDetails.size} sqft</span>
            </div>
            <div className="size">
              <BedDouble size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              <span>{posts.bedroom} bed{posts.bedroom > 1 ? 's' : ''}</span>
            </div>
            <div className="size">
              <ShowerHead size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              <span>{posts.bathroom} bathroom{posts.bathroom > 1 ? 's' : ''}</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <School size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              <div className="featureText">
                <span>School</span>
                <p>{posts.postDetails.school}km away</p>
              </div>
            </div>
            <div className="feature">
              <Bus size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{posts.postDetails.bus}km away</p>
              </div>
            </div>
            <div className="feature">
              <Soup size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{posts.postDetails.restaurant}km away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={posts} />
          </div>
          <div className="buttons">
            <div className="button">
              <MessageCircle size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              Send a Message
            </div>
            <div className="button">
              <MapPinPlus size={18} style={{ backgroundColor: "#2D336B", padding: "3px", borderRadius: '50%', color: "white" }} />
              Save Location
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SinglePage