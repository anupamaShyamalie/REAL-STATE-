import { Link, useNavigate} from "react-router";
import "./login.scss";
import { useContext, useState } from "react";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const {updateUser} = useContext(AuthContext);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    const formData = new FormData(e.target);
    
    // Get username and password from form
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      // Send request with username as expected by the API
    const res =  await apiRequest.post("/auth/login", {
        username, // Using the email input value as username
        password
      });
      updateUser(res.data)
      navigate("/");
    } catch (err) {
      console.log(err);
      // Handle different error response structures
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Login failed. Please try again.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="container">
        <div className="wrapper">
          <div className="leftPanel">
            <div className="brandingContent">
              <h1>Welcome Back</h1>
              <p>Log in to access your profile, chat with others, and manage your posts</p>
              <div className="featuresGrid">
                <div className="feature">
                  <div className="iconCircle">
                    <i className="icon-connect"></i>
                  </div>
                  <span>Connect with others</span>
                </div>
                <div className="feature">
                  <div className="iconCircle">
                    <i className="icon-share"></i>
                  </div>
                  <span>Share your experiences</span>
                </div>
                <div className="feature">
                  <div className="iconCircle">
                    <i className="icon-discover"></i>
                  </div>
                  <span>Discover new content</span>
                </div>
                <div className="feature">
                  <div className="iconCircle">
                    <i className="icon-grow"></i>
                  </div>
                  <span>Grow your network</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rightPanel">
            <div className="formContainer">
              <h2>Login to Your Account</h2>
              
              {error && <div className="errorAlert">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="formGroup">
                  <label htmlFor="username">Username</label>
                  <div className="inputWithIcon">
                    <i className="icon-email"></i>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
                
                <div className="formGroup">
                  <div className="labelWithLink">
                    <label htmlFor="password">Password</label>
                    <Link to="/forgot-password" className="forgotPassword">Forgot password?</Link>
                  </div>
                  <div className="inputWithIcon">
                    <i className="icon-lock"></i>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>
                
                <div className="rememberMe">
                  <label className="checkbox">
                    <input type="checkbox" name="remember" />
                    <span className="checkmark"></span>
                    Remember me
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  className={`loginButton ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              
              <div className="divider">
                <span>OR</span>
              </div>
              
              <div className="socialLogin">
                <button className="googleBtn" type="button">
                  <i className="icon-google"></i>
                  Login with Google
                </button>
              </div>
              
              <div className="registerLink">
                Don&apos;t have an account?
                 <Link to="/register">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;