import { listData } from '../../lib/dummydata'
import './list.scss'
import Card from "../card/Card"
import { useEffect, useState } from 'react'
import apiRequest from '../../lib/apiRequest'

// Camera in circle SVG icon for empty state
const CameraIcon = () => (
  <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="48" cy="48" r="36" stroke="#222" strokeWidth="3" fill="none"/>
    <rect x="32" y="40" width="32" height="20" rx="4" stroke="#222" strokeWidth="3" fill="none"/>
    <circle cx="48" cy="50" r="6" stroke="#222" strokeWidth="3" fill="none"/>
    <rect x="42" y="36" width="12" height="6" rx="2" stroke="#222" strokeWidth="3" fill="none"/>
  </svg>
)

// Skeleton loader for My List section
const Skeleton = () => (
  <div className="no-posts">
    <div className="skeleton-icon" />
    <div className="skeleton-text" />
  </div>
)

const List = ({ data, userId, loading: externalLoading, isSavedList, onDeleteNotification }) => {
  const [posts, setPosts] = useState(data || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (data) {
      setPosts(data)
      return
    }
    if (userId) {
      setLoading(true)
      apiRequest.get(`/posts?userId=${userId}`)
        .then(res => setPosts(res.data))
        .catch(() => setError('Failed to fetch posts'))
        .finally(() => setLoading(false))
    } else {
      setPosts(listData)
    }
  }, [data, userId])

  // Use external loading if provided (for My List section)
  const isLoading = typeof externalLoading === 'boolean' ? externalLoading : loading

  // Handler to remove a post from the list after permanent deletion
  const handleDelete = (id, result) => {
    setPosts(posts.filter(p => p.id !== id));
    if (onDeleteNotification) onDeleteNotification(result);
  }

  if (isLoading) return <Skeleton />
  if (error) return <div>{error}</div>

  return (
    <div className='list'>
      {posts.length === 0 ? (
        <div className="no-posts">
          <CameraIcon />
          <div className="no-posts-text">No posts yet</div>
        </div>
      ) : (
        posts.map(item => (
          <Card
            key={item.id}
            item={item}
            isSavedList={isSavedList}
            onRemoveSaved={id => setPosts(posts.filter(p => p.id !== id))}
            onDelete={(id, result) => handleDelete(id, result)}
            onDeleteNotification={onDeleteNotification}
          />
        ))
      )}
    </div>
  )
}

export default List