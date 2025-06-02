import { useContext } from 'react';
import SearchBar from '../../component/searchbar/SearchBar';
import './homePage.scss';
import { AuthContext } from '../../context/AuthContext';

const HomePage = () => {
  const {currentUser} = useContext(AuthContext);
  console.log(currentUser)
  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          <h1>Transform Your Space, Transform Your Life</h1>
          <p>
          Discover a revolutionary way to search for your perfect property with our real estate app. Our platform combines real-time updates, personalized recommendations, and an intuitive interface to make your home buying, renting, or investing experience seamless. With a focus on transparency and innovation, we empower you to explore new possibilities and unlock the door to your dream space. Let us transform the way you find home.
          </p>
          <SearchBar/>
          <div className="boxes">
            <div className="box">
              <h2>16+</h2>
              <h3>Year of Experience</h3>
            </div>
            <div className="box">
              <h2>200</h2>
              <h3>Award Gain</h3>
            </div>
            <div className="box">
              <h2>2000</h2>
              <h3>Property Ready</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="imgContainer">
        <img src="bg1.png" alt="" />
      </div>
    </div>
  )
}

export default HomePage