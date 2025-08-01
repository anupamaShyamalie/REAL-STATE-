import { useContext, useState } from "react";
import "./profileUpdate.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import CloudinaryUploadWidget from "../../component/upload/CloudinaryUploadWidget";

function ProfileUpdate() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [avatar, setavatar] = useState(currentUser.avatar);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    
    try {
      const updateData = {
        username,
        email,
        avatar,
      };
      
      if (password && password.trim() !== "") {
        updateData.password = password;
      }

      const res = await apiRequest.put(`/users/${currentUser.id}`, updateData);
      updateUser(res.data);
      navigate("/profile");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <div className="profileUpdatePage">
      <div className="details">
        <div className="wrapper">
          <div className="header">
            <h1>Update Profile</h1>
            <p>Update your personal information and profile picture</p>
            <button type="button" className="cancelButton" onClick={handleCancel}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
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
                  <span>Click to upload</span>
                </div>
              </div>
            </div>

            <div className="formGroup">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                defaultValue={currentUser.username}
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                defaultValue={currentUser.email}
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="formActions">
              <button type="submit" className="saveButton" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              {error && <div className="error">{error}</div>}
            </div>
          </form>
        </div>
      </div>

      <div className="previewContainer">
        <div className="wrapper">
          <div className="header">
            <h2>Profile Preview</h2>
            <p>This is how your profile will appear to others</p>
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
                  <span className="label">Username</span>
                  <span className="value">{currentUser.username || "Current Username"}</span>
                </div>
                <div className="previewItem">
                  <span className="label">Email</span>
                  <span className="value">{currentUser.email || "user@example.com"}</span>
                </div>
                <div className="previewItem">
                  <span className="label">Member Since</span>
                  <span className="value">January 2024</span>
                </div>
                <div className="previewItem">
                  <span className="label">Status</span>
                  <span className="value status">Active</span>
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