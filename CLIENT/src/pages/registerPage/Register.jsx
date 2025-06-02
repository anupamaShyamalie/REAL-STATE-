import { Link, useNavigate } from "react-router";
import "./register.scss";
import { useState } from "react";
import apiRequest from "../../lib/apiRequest";

function Register() {

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("")

    const formData = new FormData(e.target);

    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await apiRequest.post("/api/auth/register", {
        username,
        email,
        password
      })
      navigate("/login");
    } catch (err) {
      console.log(err)
      setError(err.response.data.message)
    }

  }

  return (
    <div className="registerPage">
      <div className="container">
        <div className="wrapper">
          <div className="leftPanel">
            <div className="brandingContent">
              <h1>Join Our Community</h1>
              <p>Create an account to connect with others, share your thoughts, and discover amazing content</p>
              <div className="benefitsGrid">
                <div className="benefit">
                  <div className="iconCircle">
                    <i className="icon-profile"></i>
                  </div>
                  <div className="benefitContent">
                    <h3>Personalized Profile</h3>
                    <p>Showcase your interests and connect with like-minded people</p>
                  </div>
                </div>
                <div className="benefit">
                  <div className="iconCircle">
                    <i className="icon-chat"></i>
                  </div>
                  <div className="benefitContent">
                    <h3>Real-time Chat</h3>
                    <p>Communicate with others through our integrated chat system</p>
                  </div>
                </div>
                <div className="benefit">
                  <div className="iconCircle">
                    <i className="icon-content"></i>
                  </div>
                  <div className="benefitContent">
                    <h3>Content Creation</h3>
                    <p>Share your thoughts, images, and ideas with our community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rightPanel">
            <div className="formContainer">
              <h2>Create Your Account</h2>

              <form onSubmit={handleSubmit}>
                <div className="formGroup">
                  <label htmlFor="username">Username</label>
                  <div className="inputWithIcon">
                    <i className="icon-user"></i>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                <div className="formGroup">
                  <label htmlFor="email">Email</label>
                  <div className="inputWithIcon">
                    <i className="icon-email"></i>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="formGroup">
                  <label htmlFor="password">Password</label>
                  <div className="inputWithIcon">
                    <i className="icon-lock"></i>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <div className="termsContainer">
                  <label className="checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    I agree to the <Link to="/terms" className="termsLink">Terms & Conditions</Link> and <Link to="/privacy" className="termsLink">Privacy Policy</Link>
                  </label>
                </div>

                <button type="submit" className="registerButton">
                  Create Account
                </button>
               {error && <div className="errorAlert">{error}</div> }
              </form>

              <div className="divider">
                <span>OR</span>
              </div>

              <div className="socialLogin">
                <button className="googleBtn">
                  <i className="icon-google"></i>
                  Register with Google
                </button>
              </div>

              <div className="loginLink">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;