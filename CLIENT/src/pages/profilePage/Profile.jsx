import { useContext, useEffect, useState } from "react";
import "./profile.scss";
import List from "../../component/list/List";
import Chat from "../../component/Chat/Chat";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import '../../component/Chat/chat.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Mail, LogOut, Plus, Bookmark, Settings, Home, MessageCircle, Calendar, Star } from 'lucide-react';

function Profile() {
  const { currentUser, updateUser } = useContext(AuthContext)
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedPosts, setSavedPosts] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedError, setSavedError] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.id) return;
    setLoading(true)
    apiRequest.get(`/posts?userId=${currentUser.id}`)
      .then(res => setMyPosts(res.data))
      .catch(() => setError('Failed to fetch your posts'))
      .finally(() => setLoading(false))

    // Fetch saved posts
    setSavedLoading(true)
    apiRequest.get('/users/saved')
      .then(res => setSavedPosts(res.data))
      .catch(() => setSavedError('Failed to fetch saved posts'))
      .finally(() => setSavedLoading(false))
  }, [currentUser?.id])

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null)
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }

  // Handler to show toast notification after deletion
  const handleDeleteNotification = (type) => {
    if (type === 'success') {
      toast.success('Your post was permanently deleted.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    } else {
      toast.error('Failed to delete the post.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }
  }

  const getDefaultAvatar = (username) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=667eea&color=fff&size=128&font-size=0.4`;
  };

  return (
    <div className="profilePage">
      <ToastContainer />
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="header-content">
            <div className="user-info">
              <div className="avatar-section">
                <img
                  src={currentUser.avatar || getDefaultAvatar(currentUser.username)}
                  alt="User avatar"
                  className="user-avatar"
                />
                <div className="avatar-overlay">
                  <Settings size={20} />
                </div>
              </div>
              <div className="user-details">
                <h1 className="username">{currentUser.username}</h1>
                <p className="user-email">{currentUser.email}</p>
                <div className="user-stats">
                  <div className="stat-item">
                    <Home size={16} />
                    <span>{myPosts.length} Properties</span>
                  </div>
                  <div className="stat-item">
                    <Bookmark size={16} />
                    <span>{savedPosts.length} Saved</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <Link to="/profile/update" className="btn-primary">
                <Settings size={18} />
                Edit Profile
              </Link>
              <button onClick={handleLogout} className="btn-outline">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="content-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === 'my-posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-posts')}
            >
              <Home size={18} />
              My Properties
            </button>
            <button 
              className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark size={18} />
              Saved Properties
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'profile' && (
              <div className="profile-tab">
                <div className="profile-card">
                  <div className="card-header">
                    <h2>Personal Information</h2>
                    <p>Manage your account details and preferences</p>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-icon">
                        <User size={20} />
                      </div>
                      <div className="info-content">
                        <label>Username</label>
                        <span>{currentUser.username}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">
                        <Mail size={20} />
                      </div>
                      <div className="info-content">
                        <label>Email Address</label>
                        <span>{currentUser.email}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">
                        <Calendar size={20} />
                      </div>
                      <div className="info-content">
                        <label>Member Since</label>
                        <span>January 2024</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">
                        <Star size={20} />
                      </div>
                      <div className="info-content">
                        <label>Account Status</label>
                        <span className="status-badge">Verified</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions">
                    <Link to="/profile/update" className="btn-primary">
                      <Settings size={18} />
                      Update Profile
                    </Link>
                    <button onClick={handleLogout} className="btn-outline">
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'my-posts' && (
              <div className="my-posts-tab">
                <div className="section-header">
                  <div className="header-content">
                    <h2>My Properties</h2>
                    <p>Manage your property listings and create new ones</p>
                  </div>
                  <Link to="/newpost" className="btn-primary">
                    <Plus size={18} />
                    Add New Property
                  </Link>
                </div>
                
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your properties...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-outline">
                      Try Again
                    </button>
                  </div>
                ) : myPosts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🏠</div>
                    <h3>No Properties Yet</h3>
                    <p>Start by creating your first property listing</p>
                    <Link to="/newpost" className="btn-primary">
                      <Plus size={18} />
                      Create First Property
                    </Link>
                  </div>
                ) : (
                  <List data={myPosts} onDeleteNotification={handleDeleteNotification} />
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="saved-tab">
                <div className="section-header">
                  <div className="header-content">
                    <h2>Saved Properties</h2>
                    <p>Your favorite properties and bookmarks</p>
                  </div>
                </div>
                
                {savedLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading saved properties...</p>
                  </div>
                ) : savedError ? (
                  <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <p>{savedError}</p>
                    <button onClick={() => window.location.reload()} className="btn-outline">
                      Try Again
                    </button>
                  </div>
                ) : savedPosts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🔖</div>
                    <h3>No Saved Properties</h3>
                    <p>Start exploring and save properties you like</p>
                    <Link to="/" className="btn-primary">
                      <Home size={18} />
                      Browse Properties
                    </Link>
                  </div>
                ) : (
                  <List data={savedPosts} loading={savedLoading} isSavedList />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-wrapper">
          <Chat />
        </div>
      </div>
    </div>
  )
}

export default Profile;