
import { useState, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import './filter.scss';

const Filter = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Fetch all locations for logic, but do not show in UI
  const [locations, setLocations] = useState([]);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await apiRequest.get('/posts/locations');
        setLocations(response.data);
      } catch (error) {
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  // Controlled form state, initialized from URL params
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    property: searchParams.get('property') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedroom: searchParams.get('bedroom') || '',
    bathroom: searchParams.get('bathroom') || '',
  });

  // Update state if URL params change (e.g., browser navigation)
  useEffect(() => {
    setFilters({
      city: searchParams.get('city') || '',
      type: searchParams.get('type') || '',
      property: searchParams.get('property') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      bedroom: searchParams.get('bedroom') || '',
      bathroom: searchParams.get('bathroom') || '',
    });
    // eslint-disable-next-line
  }, [searchParams.toString()]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.city && filters.city !== 'ALL') params.append('city', filters.city);
    if (filters.type) params.append('type', filters.type);
    if (filters.property) params.append('property', filters.property);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.bedroom) params.append('bedroom', filters.bedroom);
    if (filters.bathroom) params.append('bathroom', filters.bathroom);
    navigate(`/list?${params.toString()}`);
  };

  // Title logic
  const cityTitle = filters.city && filters.city !== 'ALL' ? filters.city : 'All';

  return (
    <form className='filter' onSubmit={handleSubmit}>
      <div className="filter-header">
        <div className="header-content">
          <h2>Search Filters</h2>
          <p className="filter-subtitle">Refine your property search</p>
        </div>
        <button
          type="button"
          className="clear-btn"
          title="Clear all filters"
          onClick={() => {
            setFilters({
              city: '',
              type: '',
              property: '',
              minPrice: '',
              maxPrice: '',
              bedroom: '',
              bathroom: '',
            });
            navigate('/list');
          }}
        >
          <RotateCcw className="clear-icon" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="filter-content">
        <div className="filter-section">
          <h3 className="section-title">Location</h3>
          <div className="item">
            <label htmlFor="city">City Location</label>
            <input
              type="text"
              placeholder="Enter city name"
              id="city"
              name="city"
              value={filters.city}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="filter-section">
          <h3 className="section-title">Property Details</h3>
          <div className="item">
            <label htmlFor="type">Transaction Type</label>
            <select name="type" id="type" value={filters.type} onChange={handleChange}>
              <option value="">Any Type</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div className="item">
            <label htmlFor="property">Property Type</label>
            <select name="property" id="property" value={filters.property} onChange={handleChange}>
              <option value="">Any Property</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
            </select>
          </div>
        </div>

        <div className="filter-section">
          <h3 className="section-title">Price Range</h3>
          <div className="price-inputs">
            <div className="item">
              <label htmlFor="minPrice">Min Price</label>
              <input 
                type="number" 
                placeholder='$0' 
                id='minPrice' 
                name='minPrice' 
                value={filters.minPrice} 
                onChange={handleChange} 
              />
            </div>
            <div className="item">
              <label htmlFor="maxPrice">Max Price</label>
              <input 
                type="number" 
                placeholder='$1,000,000' 
                id='maxPrice' 
                name='maxPrice' 
                value={filters.maxPrice} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>

        <div className="filter-section">
          <h3 className="section-title">Rooms</h3>
          <div className="room-inputs">
            <div className="item">
              <label htmlFor="bedroom">Bedrooms</label>
              <input 
                type="number" 
                placeholder='Any' 
                id='bedroom' 
                name='bedroom' 
                value={filters.bedroom} 
                onChange={handleChange} 
              />
            </div>
            <div className="item">
              <label htmlFor="bathroom">Bathrooms</label>
              <input 
                type="number" 
                placeholder='Any' 
                id='bathroom' 
                name='bathroom' 
                value={filters.bathroom} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>

        <div className="search-section">
          <button type="submit" className="search-btn">
            <Search className='search-icon' />
            <span>Search Properties</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default Filter;