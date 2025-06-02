import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './slider.scss';
import PropTypes from 'prop-types';
import { useState } from 'react';

const Slider = ({ images }) => {
  const [imageIndex, setImageIndex] = useState(null);
  const [animation, setAnimation] = useState('');

  const changeSlice = (direction) => {
    if (direction === "left") {
      setAnimation('slide-left');
      if (imageIndex === 0) {
        setImageIndex(images.length - 1);
      } else {
        setImageIndex(imageIndex - 1);
      }
    } else {
      setAnimation('slide-right');
      if (imageIndex === images.length - 1) {
        setImageIndex(0);
      } else {
        setImageIndex(imageIndex + 1);
      }
    }
  };

  return (
    <div className="slider">
      {imageIndex !== null && (
        <div className="fullSlider">
          <div className="arrow">
            <ChevronLeft size={32} onClick={() => changeSlice("left")} />
          </div>
          <div className="imgContainer">
            <img
              src={images[imageIndex]}
              alt=""
              className={animation}
              onAnimationEnd={() => setAnimation('')}
            />
          </div>
          <div className="arrow">
            <ChevronRight size={32} onClick={() => changeSlice("right")} />
          </div>
          <div className="close">
            <X size={32} onClick={() => setImageIndex(null)} />
          </div>
        </div>
      )}

      <div className="bigImage">
        <img src={images[0]} alt="" onClick={() => setImageIndex(0)} />
      </div>
      <div className="smallImages">
        {images.slice(1).map((image, index) => (
          <img
            src={image}
            key={index}
            alt="Main slide"
            onClick={() => setImageIndex(index + 1)}
          />
        ))}
      </div>
    </div>
  );
}

Slider.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Slider;
