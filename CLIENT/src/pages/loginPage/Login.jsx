import { Link, useNavigate} from "react-router-dom";
import "./login.scss";
import { useContext, useState, useEffect } from "react";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Home, MessageCircle, Upload, Check, X, Shield, Clock } from 'lucide-react';

function Login() {
  const {updateUser} = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    password: ""
  });
  const [touched, setTouched] = useState({
    username: false,
    password: false
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // Validation rules
  const validationRules = {
    username: {
      required: true,
      message: {
        required: "Username is required"
      }
    },
    password: {
      required: true,
      message: {
        required: "Password is required"
      }
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    if (rules.required && !value.trim()) {
      return rules.message.required;
    }

    return "";
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      errors[field] = error;
      if (error) isValid = false;
    });

    setValidationErrors(errors);
    setIsFormValid(isValid);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear API error when user starts typing
    if (error) setError("");
  };

  // Handle input blur
  const handleInputBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Validate on form data change
  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Mark all fields as touched
    setTouched({
      username: true,
      password: true
    });

    // Validate form
    validateForm();

    // Check if form is valid
    if (!isFormValid) {
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest.post("/auth/login", formData);
      updateUser(res.data);
      navigate("/");
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Login failed. Please try again.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get field status
  const getFieldStatus = (fieldName) => {
    const isTouched = touched[fieldName];
    const hasError = validationErrors[fieldName];
    const hasValue = formData[fieldName].trim();

    if (!isTouched) return "default";
    if (hasError) return "error";
    if (hasValue) return "success";
    return "default";
  };

  return (
    <div className="loginPage">
      <div className="login-container">
        <div className="login-wrapper">
          {/* Left Panel - Branding & Benefits */}
          <div className="login-left">
            <div className="branding-section">
              <div className="branding-header">
                <h1>Welcome Back to Real Estate</h1>
                <p>Sign in to access your saved properties, connect with agents, and continue your property search</p>
              </div>
              
              <div className="benefits-section">
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <Home size={24} />
                  </div>
                  <div className="benefit-content">
                    <h3>Your Saved Properties</h3>
                    <p>Access your favorite listings and property searches</p>
                  </div>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <MessageCircle size={24} />
                  </div>
                  <div className="benefit-content">
                    <h3>Agent Communications</h3>
                    <p>Continue conversations with real estate agents</p>
                  </div>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <Shield size={24} />
                  </div>
                  <div className="benefit-content">
                    <h3>Secure Access</h3>
                    <p>Your account is protected with industry-standard security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="login-right">
            <div className="form-section">
              <div className="form-header">
                <h2>Sign In to Your Account</h2>
                <p>Welcome back! Please enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className={`input-wrapper ${getFieldStatus('username')}`}>
                    <User size={20} className="input-icon" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Enter your username"
                      autoComplete="username"
                      required
                    />
                    {getFieldStatus('username') === 'success' && (
                      <Check size={16} className="status-icon success" />
                    )}
                    {getFieldStatus('username') === 'error' && (
                      <X size={16} className="status-icon error" />
                    )}
                  </div>
                  {touched.username && validationErrors.username && (
                    <div className="field-error">
                      <AlertCircle size={14} />
                      <span>{validationErrors.username}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="label-with-link">
                    <label htmlFor="password">Password</label>
                    <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                  </div>
                  <div className={`input-wrapper ${getFieldStatus('password')}`}>
                    <Lock size={20} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {getFieldStatus('password') === 'success' && (
                      <Check size={16} className="status-icon success" />
                    )}
                    {getFieldStatus('password') === 'error' && (
                      <X size={16} className="status-icon error" />
                    )}
                  </div>
                  {touched.password && validationErrors.password && (
                    <div className="field-error">
                      <AlertCircle size={14} />
                      <span>{validationErrors.password}</span>
                    </div>
                  )}
                </div>

                <div className="remember-section">
                  <label className="checkbox-wrapper">
                    <input type="checkbox" name="remember" />
                    <span className="checkmark"></span>
                    <span className="remember-text">Remember me for 30 days</span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="spinner" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Sign In
                    </>
                  )}
                </button>

                {error && (
                  <div className="error-message">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}
              </form>

              <div className="divider">
                <span>or</span>
              </div>

              <div className="social-login">
                <button className="google-btn" type="button">
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="register-link">
                Don't have an account? <Link to="/register" className="link">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;