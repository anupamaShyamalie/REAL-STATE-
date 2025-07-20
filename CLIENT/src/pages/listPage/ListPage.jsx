import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Card from '../../component/card/Card';
import Filter from '../../component/filter/Filter';
import Map from '../../component/map/Map';
import apiRequest from '../../lib/apiRequest';
import './listPage.scss';

const ListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();

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

  if (loading) {
    return (
      <div className='listPage'>
        <div className="listContainer">
          <div className="wrapper">
            <div className="loading-skeletons">
              {[1,2,3,4].map((i) => (
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
              <div className="progress-bar">
                <div className="progress"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='listPage'>
        <div className="listContainer">
          <div className="wrapper">
            <div className="error">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='listPage'>
      <div className="listContainer">
        <div className="wrapper">
          <div className="filter-fixed">
            <Filter/>
          </div>
          <div className="post-list-scroll">
            {posts.length > 0 ? (
              posts.map(item => (
                <Card key={item.id} item={item}/>
              ))
            ) : (
              <div className="no-posts">No posts available</div>
            )}
          </div>
        </div>
      </div>
      <div className="mapContainer">
        <Map items={posts} />
      </div>
    </div>
  );
};

export default ListPage;