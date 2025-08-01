import { Link, useNavigate } from "react-router-dom";
import "./register.scss";
import { useState, useEffect } from "react";
import apiRequest from "../../lib/apiRequest";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Home, MessageCircle, Upload, Check, X } from 'lucide-react';

function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // Validation rules
  const validationRules = {
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: {
        required: "Username is required",
        minLength: "Username must be at least 3 characters",
        maxLength: "Username must be less than 20 characters",
        pattern: "Username can only contain letters, numbers, and underscores"
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: {
        required: "Email is required",
        pattern: "Please enter a valid email address"
      }
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: {
        required: "Password is required",
        minLength: "Password must be at least 8 characters",
        pattern: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
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

    if (value.trim() && rules.minLength && value.length < rules.minLength) {
      return rules.message.minLength;
    }

    if (value.trim() && rules.maxLength && value.length > rules.maxLength) {
      return rules.message.maxLength;
    }

    if (value.trim() && rules.pattern && !rules.pattern.test(value)) {
      return rules.message.pattern;
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
      email: true,
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
      await apiRequest.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Registration failed");
      } else if (err.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
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
    <div className="registerPage">
      <div className="register-container">
        <div className="register-wrapper">
          {/* Left Panel - Branding & Benefits */}
          <div className="register-left">
            <div className="branding-section">
              <div className="branding-header">
                <h1>Join Our Real Estate Community</h1>
                <p>Create your account to discover amazing properties, connect with agents, and find your perfect home</p>
              </div>
              
              <div className="benefits-section">
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <Home size={24} />
                  </div>
                  <div className="benefit-content">
                    <h3>Find Your Dream Home</h3>
                    <p>Browse thousands of properties with detailed information and high-quality images</p>
                  </div>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <MessageCircle size={24} />
                  </div>
                  <div className="benefit-content">
                    <h3>Connect with Agents</h3>
                    <p>Chat directly with verified real estate agents and get instant responses</p>
                  </div>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <Upload size={24} />
                  </div>
                  <div className="benefit-content">
                    <h3>List Your Property</h3>
                    <p>Showcase your properties to potential buyers and renters worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Registration Form */}
          <div className="register-right">
            <div className="form-section">
              <div className="form-header">
                <h2>Create Your Account</h2>
                <p>Join thousands of users finding their perfect properties</p>
              </div>

              <form onSubmit={handleSubmit} className="register-form">
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
                      placeholder="Choose a username"
                      autoComplete="off"
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
                  <label htmlFor="email">Email Address</label>
                  <div className={`input-wrapper ${getFieldStatus('email')}`}>
                    <Mail size={20} className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Enter your email"
                      autoComplete="off"
                      required
                    />
                    {getFieldStatus('email') === 'success' && (
                      <Check size={16} className="status-icon success" />
                    )}
                    {getFieldStatus('email') === 'error' && (
                      <X size={16} className="status-icon error" />
                    )}
                  </div>
                  {touched.email && validationErrors.email && (
                    <div className="field-error">
                      <AlertCircle size={14} />
                      <span>{validationErrors.email}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className={`input-wrapper ${getFieldStatus('password')}`}>
                    <Lock size={20} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
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
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className={`strength-fill ${getPasswordStrength()}`}
                          style={{ width: `${getPasswordStrengthPercentage()}%` }}
                        ></div>
                      </div>
                      <span className="strength-text">{getPasswordStrengthText()}</span>
                    </div>
                  )}
                </div>

                <div className="terms-section">
                  <label className="checkbox-wrapper">
                    <input type="checkbox" required />
                    <span className="checkmark"></span>
                    <span className="terms-text">
                      I agree to the <Link to="/terms" className="link">Terms & Conditions</Link> and <Link to="/privacy" className="link">Privacy Policy</Link>
                    </span>
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Create Account
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

              <div className="login-link">
                Already have an account? <Link to="/login" className="link">Sign In</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Password strength functions
  function getPasswordStrength() {
    const password = formData.password;
    if (!password) return 'weak';
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  function getPasswordStrengthPercentage() {
    const password = formData.password;
    if (!password) return 0;
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    return (score / 5) * 100;
  }

  function getPasswordStrengthText() {
    const strength = getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Weak password';
      case 'medium': return 'Medium strength';
      case 'strong': return 'Strong password';
      default: return '';
    }
  }
}

export default Register;