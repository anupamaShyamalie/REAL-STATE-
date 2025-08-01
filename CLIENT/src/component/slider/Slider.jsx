import { ChevronLeft, ChevronRight, X, Maximize2, Play, Pause } from 'lucide-react';
import './slider.scss';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const Slider = ({ images }) => {
  const [imageIndex, setImageIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animation, setAnimation] = useState('');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isAutoPlaying && imageIndex === null) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, imageIndex, images.length]);

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

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setImageIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleImageError = (e) => {
    e.target.src = '/default-property.jpg'; // Fallback image
  };

  return (
    <div className="slider">
      {/* Full Screen Modal */}
      {imageIndex !== null && (
        <div className="fullSlider">
          <div className="modal-overlay" onClick={() => setImageIndex(null)} />
          <div className="modal-content">
            <div className="modal-header">
              <span className="image-counter">
                {imageIndex + 1} / {images.length}
              </span>
              <button className="close-btn" onClick={() => setImageIndex(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <button className="nav-btn prev-btn" onClick={() => changeSlice("left")}>
                <ChevronLeft size={32} />
              </button>
              
              <div className="imgContainer">
                <img
                  src={images[imageIndex]}
                  alt={`Property image ${imageIndex + 1}`}
                  className={animation}
                  onAnimationEnd={() => setAnimation('')}
                  onError={handleImageError}
                />
              </div>
              
              <button className="nav-btn next-btn" onClick={() => changeSlice("right")}>
                <ChevronRight size={32} />
              </button>
            </div>
            
            <div className="modal-thumbnails">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={index === imageIndex ? 'active' : ''}
                  onClick={() => setImageIndex(index)}
                  onError={handleImageError}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Slider */}
      <div className="slider-container">
        <div className="main-image">
          <img 
            src={images[currentSlide]} 
            alt={`Property image ${currentSlide + 1}`}
            onError={handleImageError}
          />
          
          <div className="image-overlay">
            <div className="overlay-controls">
              <button 
                className="control-btn fullscreen-btn" 
                onClick={() => setImageIndex(currentSlide)}
                title="View fullscreen"
              >
                <Maximize2 size={20} />
              </button>
              
              <button 
                className={`control-btn autoplay-btn ${isAutoPlaying ? 'playing' : ''}`}
                onClick={toggleAutoPlay}
                title={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>
            
            <div className="slide-indicators">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
          
          <button 
            className="nav-arrow prev-arrow" 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            className="nav-arrow next-arrow" 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="thumbnail-grid">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`thumbnail ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`}
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Slider.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Slider;
