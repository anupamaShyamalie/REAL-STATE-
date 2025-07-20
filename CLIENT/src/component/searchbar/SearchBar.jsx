import { useState, useEffect } from 'react'
import './searchBar.scss'
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';

const types = ["ALL", "Buy", "Rent"];

const SearchBar = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);

    const [query, setQuery] = useState({
        type: "ALL",
        location: "",
        minprice: "",
        maxprice: ""
    });

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await apiRequest.get('/posts/locations');
                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocations();
    }, []);

    const switchType = (val) => {
        setQuery((prev) => ({ ...prev, type: val }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuery((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Build search parameters
        const searchParams = new URLSearchParams();
        
        if (query.type && query.type !== "ALL") {
            searchParams.append('type', query.type.toLowerCase());
        }
        if (query.location && query.location !== "ALL" && query.location !== "") {
            searchParams.append('city', query.location);
        }
        if (query.minprice) {
            searchParams.append('minPrice', query.minprice);
        }
        if (query.maxprice) {
            searchParams.append('maxPrice', query.maxprice);
        }
        
        // Navigate to list page with search parameters
        const searchQuery = searchParams.toString();
        navigate(`/list?${searchQuery}`);
    };

    return (
        <div className='search'>
            <div className="type">
                {types.map((type) => (
                    <button 
                        key={type} 
                        onClick={() => switchType(type)} 
                        className={query.type === type ? "active" : ""}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <select 
                    name="location" 
                    value={query.location}
                    onChange={handleInputChange}
                >
                    <option value="" disabled>Location</option>
                    <option value="ALL">All locations</option>
                    {locations.map((location, index) => (
                        <option key={index} value={location}>
                            {location}
                        </option>
                    ))}
                </select>
                <input 
                    type="number" 
                    name="minprice" 
                    min={0} 
                    placeholder='Min Price'
                    value={query.minprice}
                    onChange={handleInputChange}
                    style={{ fontFamily: 'inherit' }}
                />
                <input 
                    type="number" 
                    name="maxprice" 
                    min={0} 
                    placeholder='Max Price'
                    value={query.maxprice}
                    onChange={handleInputChange}
                    style={{ fontFamily: 'inherit' }}
                />
                <button type="submit">
                    <Search />
                </button>
            </form>
        </div>
    );
};

export default SearchBar;