import { useContext } from "react";
import "./profile.scss";
import List from "../../component/list/List";
import Chat from "../../component/Chat/Chat";
import { Link, useNavigate } from "react-router";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";

function Profile() {
  const { currentUser, updateUser } = useContext(AuthContext)

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null)
      navigate("/");

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="profilePage">
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
          <List />
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <List />
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