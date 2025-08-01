import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Card from '../../component/card/Card';
import Filter from '../../component/filter/Filter';
import Map from '../../component/map/Map';
import apiRequest from '../../lib/apiRequest';
import './listPage.scss';
import { 
  MapPin, 
  Home, 
  Search, 
  Filter as FilterIcon, 
  Grid3X3, 
  List,
  Loader2,
  AlertCircle,
  Building2
} from 'lucide-react';

const ListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showMap, setShowMap] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Get search parameters from URL
        const type = searchParams.get('type');
        const city = searchParams.get('city');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const property = searchParams.get('property');
        const bedroom = searchParams.get('bedroom');
        const bathroom = searchParams.get('bathroom');
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (type) queryParams.append('type', type);
        if (city) queryParams.append('city', city);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (property) queryParams.append('property', property);
        if (bedroom) queryParams.append('bedroom', bedroom);
        if (bathroom) queryParams.append('bathroom', bathroom);
        
        const response = await apiRequest.get(`/posts?${queryParams.toString()}`);
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [location]);

  // Get search summary
  const getSearchSummary = () => {
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const property = searchParams.get('property');
    
    const filters = [];
    if (type) filters.push(type);
    if (city) filters.push(city);
    if (property) filters.push(property);
    
    return filters.length > 0 ? filters.join(', ') : 'All Properties';
  };

  if (loading) {
    return (
      <div className='listPage'>
        <div className="listPage-container">
          {/* Header Section */}
          <div className="listPage-header">
            <div className="header-content">
              <div className="search-summary">
                <h1>Search Results</h1>
                <p className="search-description">
                  <Search size={16} />
                  <span>{getSearchSummary()}</span>
                </p>
              </div>
              <div className="header-actions">
                <button 
                  className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
                >
                  {viewMode === 'grid' ? <List size={18} /> : <Grid3X3 size={18} />}
                </button>
                <button 
                  className={`map-toggle ${showMap ? 'active' : ''}`}
                  onClick={() => setShowMap(!showMap)}
                  title={showMap ? 'Hide Map' : 'Show Map'}
                >
                  <MapPin size={18} />
                </button>
                <button 
                  className="filter-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                  title="Toggle Filters"
                >
                  <FilterIcon size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          <div className="loading-container">
            <div className="loading-content">
              <Loader2 className="loading-spinner" size={32} />
              <h3>Finding your perfect properties...</h3>
              <p>Please wait while we search through our listings</p>
            </div>
            <div className="loading-skeletons">
              {[1, 2, 3, 4].map((i) => (
                <div className="card skeleton" key={i}>
                  <div className="imgContainer">
                    <div className="img-skeleton shimmer"></div>
                  </div>
                  <div className="textContainer">
                    <div className="title-skeleton shimmer"></div>
                    <div className="address-skeleton shimmer"></div>
                    <div className="price-skeleton shimmer"></div>
                    <div className="bottom">
                      <div className="features">
                        <div className="feature-skeleton shimmer"></div>
                        <div className="feature-skeleton shimmer"></div>
                      </div>
                      <div className="icons">
                        <div className="icon-skeleton shimmer"></div>
                        <div className="icon-skeleton shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='listPage'>
        <div className="listPage-container">
          <div className="error-container">
            <AlertCircle size={48} className="error-icon" />
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='listPage'>
      <div className="listPage-container">
        {/* Header Section */}
        <div className="listPage-header">
          <div className="header-content">
            <div className="search-summary">
              <h1>Search Results</h1>
              <p className="search-description">
                <Search size={16} />
                <span>{getSearchSummary()}</span>
                {posts.length > 0 && (
                  <span className="results-count">
                    • {posts.length} {posts.length === 1 ? 'property' : 'properties'} found
                  </span>
                )}
              </p>
            </div>
            <div className="header-actions">
              <button 
                className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              >
                {viewMode === 'grid' ? <List size={18} /> : <Grid3X3 size={18} />}
              </button>
              <button 
                className={`map-toggle ${showMap ? 'active' : ''}`}
                onClick={() => setShowMap(!showMap)}
                title={showMap ? 'Hide Map' : 'Show Map'}
              >
                <MapPin size={18} />
              </button>
              <button 
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
                title="Toggle Filters"
              >
                <FilterIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="listPage-content">
          {/* Filters Section */}
          <div className={`filters-section ${showFilters ? 'active' : ''}`}>
            <Filter />
          </div>

          {/* Results Section */}
          <div className={`results-section ${showMap ? 'with-map' : 'full-width'}`}>
            {posts.length > 0 ? (
              <div className={`posts-container ${viewMode}`}>
                {posts.map(item => (
                  <Card key={item.id} item={item} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <Building2 size={64} className="no-results-icon" />
                <h2>No properties found</h2>
                <p>Try adjusting your search criteria or browse all properties</p>
                <button 
                  className="browse-all-btn"
                  onClick={() => window.location.href = '/list'}
                >
                  Browse All Properties
                </button>
              </div>
            )}
          </div>

          {/* Map Section */}
          {showMap && (
            <div className="map-section">
              <Map items={posts} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListPage;