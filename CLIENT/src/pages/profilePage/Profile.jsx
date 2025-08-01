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

function Profile() {
  const { currentUser, updateUser } = useContext(AuthContext)
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedPosts, setSavedPosts] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedError, setSavedError] = useState(null)

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

  return (
    <div className="profilePage">
      <ToastContainer />
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to={"/profile/update"}>
            <button >Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img
                src={currentUser.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png"}
                alt="User avatar"
              />
            </span>
            <span>
              Username: <b>{currentUser.username}</b>
            </span>
            <span>
              E-mail: <b>{currentUser.email}</b>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="title">
            <h1>My List</h1>
            <button><Link to={'/newpost'}>Create New Post</Link></button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : (
            <List data={myPosts} onDeleteNotification={handleDeleteNotification} />
          )}
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <List data={savedPosts} loading={savedLoading} isSavedList />
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Chat />
        </div>
      </div>
    </div>
  )

}

export default Profile;