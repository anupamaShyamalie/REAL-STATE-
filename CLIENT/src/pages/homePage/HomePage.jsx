import { useContext } from 'react';
import SearchBar from '../../component/searchbar/SearchBar';
import './homePage.scss';
import { AuthContext } from '../../context/AuthContext';
import { MapPin, Award, Home, Users, TrendingUp, Shield, Clock } from 'lucide-react';

const HomePage = () => {
  const {currentUser} = useContext(AuthContext);
  
  return (
    <div className="homePage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="text-container">
              <div className="hero-badge">
                <span>🏆 Trusted by 10,000+ Users</span>
              </div>
              
              <h1 className="hero-title">
                Find Your Perfect
                <span className="highlight"> Home</span>
              </h1>
              
              <p className="hero-description">
                Discover exceptional properties with our advanced search platform. 
                From cozy apartments to luxury estates, we connect you with your dream home 
                through innovative technology and personalized service.
              </p>
              
              <div className="search-container">
                <SearchBar />
              </div>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-icon">
                    <Home size={20} />
                  </div>
                  <div className="stat-content">
                    <h3>2,000+</h3>
                    <p>Properties Available</p>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">
                    <Users size={20} />
                  </div>
                  <div className="stat-content">
                    <h3>500+</h3>
                    <p>Happy Clients</p>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">
                    <Award size={20} />
                  </div>
                  <div className="stat-content">
                    <h3>16+</h3>
                    <p>Years Experience</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="image-container">
              <div className="image-wrapper">
                <img src="bg1.png" alt="Modern Real Estate" />
                <div className="floating-card">
                  <div className="card-icon">
                    <Shield size={16} />
                  </div>
                  <div className="card-content">
                    <h4>Secure Transactions</h4>
                    <p>100% Safe & Protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Us</h2>
            <p>Experience the difference with our comprehensive real estate platform</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <MapPin size={24} />
              </div>
              <h3>Smart Location Search</h3>
              <p>Find properties in your preferred neighborhoods with our intelligent location-based search</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp size={24} />
              </div>
              <h3>Market Insights</h3>
              <p>Get real-time market data and price trends to make informed decisions</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={24} />
              </div>
              <h3>Instant Updates</h3>
              <p>Receive immediate notifications about new listings and price changes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Dream Home?</h2>
            <p>Join thousands of satisfied customers who found their perfect property with us</p>
            {!currentUser && (
              <div className="cta-buttons">
                <button className="btn-primary">Get Started</button>
                <button className="btn-secondary">Learn More</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage