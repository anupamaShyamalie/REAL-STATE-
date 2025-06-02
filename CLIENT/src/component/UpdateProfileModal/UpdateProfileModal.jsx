import  { useState } from "react";
import "./UpdateProfileModal.scss";

function UpdateProfileModal({ profileData, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    username: profileData.username,
    email: profileData.email,
    avatar: profileData.avatar,
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profileData.avatar ||"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png");
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, you would handle file upload to a server here
      // For now, we'll just use the preview URL for the avatar
      const updatedData = {
        username: formData.username,
        email: formData.email,
        // Use the new preview URL if a file was selected
        avatar: selectedFile ? previewUrl : profileData.avatar
      };
      
      onUpdate(updatedData);
    }
  };
  
  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <div className="modalHeader">
          <h2>Update Profile</h2>
          <button className="closeButton" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="updateForm">
          <div className="formGroup avatarUpload">
            <label>Profile Picture</label>
            <div className="avatarPreview">
              <img src={previewUrl} alt="Avatar preview" />
              <div className="uploadOverlay">
                <input
                  type="file"
                  id="avatarUpload"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="avatarUpload">Change Photo</label>
              </div>
            </div>
          </div>
          
          <div className="formGroup">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? "errorInput" : ""}
            />
            {errors.username && <span className="errorText">{errors.username}</span>}
          </div>
          
          <div className="formGroup">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "errorInput" : ""}
            />
            {errors.email && <span className="errorText">{errors.email}</span>}
          </div>
          
          <div className="formGroup">
            <label htmlFor="password">Password (leave blank to keep current)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "errorInput" : ""}
            />
            {errors.password && <span className="errorText">{errors.password}</span>}
          </div>
          
          <div className="formGroup">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? "errorInput" : ""}
            />
            {errors.confirmPassword && <span className="errorText">{errors.confirmPassword}</span>}
          </div>
          
          <div className="formActions">
            <button type="button" className="cancelButton" onClick={onClose}>Cancel</button>
            <button type="submit" className="saveButton">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfileModal;