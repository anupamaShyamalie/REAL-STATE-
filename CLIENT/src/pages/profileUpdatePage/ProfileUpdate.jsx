import { useContext, useState } from "react";
import "./profileupdate.css";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { useNavigate } from "react-router";
import CloudinaryUploadWidget from "../../component/upload/CloudinaryUploadWidget";

function ProfileUpdate() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [avatar, setavatar] = useState(currentUser.avatar);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    
    try {
      // Include avatar in the update request
      const updateData = {
        username,
        email,
        avatar, // Include the avatar URL
      };
      
      // Only include password if it's not empty
      if (password && password.trim() !== "") {
        updateData.password = password;
      }

      const res = await apiRequest.put(`/users/${currentUser.id}`, updateData);
      updateUser(res.data);
      navigate("/profile");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <div className="profileUpdatePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>Update Profile</h1>
            <button type="button" className="cancelButton" onClick={handleCancel}>
              Cancel
            </button>
          </div>

          <form className="updateForm" onSubmit={handleSubmit}>
            <div className="formGroup avatarUpload">
              <label>Profile Picture</label>
              <div className="avatarPreview">
                <img 
                  src={avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png"} 
                  alt="Avatar preview" 
                />
                <div className="uploadOverlay">
                  <CloudinaryUploadWidget 
                    uwConfig={{
                      cloudName: "dblwkkext",
                      uploadPreset: "estate",
                      multiple: false,
                      maxImageFileSize: 2000000,
                      folder: "avatars"
                    }}
                    setavatar={setavatar}
                  />
                </div>
              </div>
            </div>

            <div className="formGroup">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter username"
                defaultValue={currentUser.username}
              />
            </div>

            <div className="formGroup">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email"
                defaultValue={currentUser.email}
              />
            </div>

            <div className="formGroup">
              <label htmlFor="password">Password (leave blank to keep current)</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter new password"
              />
            </div>

            <div className="formActions">
              <button type="submit" className="saveButton">Save Changes</button>
              {error && <span className="error">{error}</span>}
            </div>
          </form>
        </div>
      </div>

      <div className="previewContainer">
        <div className="wrapper">
          <div className="title">
            <h1>Profile Preview</h1>
          </div>
          <div className="profilePreview">
            <div className="previewCard">
              <div className="previewAvatar">
                <img 
                  src={avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png"} 
                  alt="Profile preview" 
                />
              </div>
              <div className="previewInfo">
                <div className="previewItem">
                  <span className="label">Username:</span>
                  <span className="value">{currentUser.username || "Current Username"}</span>
                </div>
                <div className="previewItem">
                  <span className="label">Email:</span>
                  <span className="value">{currentUser.email || "user@example.com"}</span>
                </div>
                <div className="previewItem">
                  <span className="label">Member Since:</span>
                  <span className="value">January 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileUpdate;