import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AboutPage.css";
import logo2 from "../homePageFront/images/logo2.png";
import profile from "../homePageFront/images/profile.jpg";

const AboutPage = () => {
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${backendURL}api/get-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUserProfile();
  }, [backendURL, navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePostService = () => {
    navigate("/postservice");
  };

  return (
    <>
      <div className="about-head-container">
        <title>About Us | Archer's Freelance Hub</title>
      </div>

      <div className="about-body-container">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <img src={logo2} alt="Archer's Freelance Hub" className="logo-img" />
            <div className="brand-text">
              <h1 className="logo-text">Archer's Freelance Hub</h1>
              <span className="badge">DLSU Exclusive</span>
            </div>
          </div>
          <nav className="header-nav">
            <Link to="/homepage" className="nav-link">
              Home
            </Link>
            <Link to="/about" className="nav-link active">
              About
            </Link>
            <Link to="/my-projects" className="nav-link">
              My Projects
            </Link>
          </nav>
          <div className="header-right">
            <button className="post-btn" onClick={handlePostService}>
              + Post Services
            </button>
            <button className="logout-btn" onClick={handleSignOut}>
              Log out
            </button>
            <div
              className="profile-icon"
              onClick={() => navigate("/my-projects")}
              style={{ cursor: "pointer" }}
            >
              <img src={userProfile?.profileimage || profile} alt="Profile" />
              <span className="online-indicator" />
            </div>
          </div>
        </header>

        <main className="about-main-container">
          <div className="about-hero">
            <h1>About Archer's Freelance Hub</h1>
            <p>Connecting DLSU talents with real-world opportunities</p>
          </div>

          <div className="about-content">
            <section className="about-section">
              <h2>🎓 Our Mission</h2>
              <p>
                Archer's Freelance Hub is a platform dedicated to empowering DLSU students and alumni 
                by providing a space to showcase their skills and connect with clients who need their expertise.
              </p>
            </section>

            <section className="about-section">
              <h2>💡 What We Offer</h2>
              <div className="about-features">
                <div className="about-feature">
                  <span className="about-feature-icon">🔍</span>
                  <h3>Find Talent</h3>
                  <p>Search and discover skilled freelancers from the DLSU community</p>
                </div>
                <div className="about-feature">
                  <span className="about-feature-icon">📝</span>
                  <h3>Post Services</h3>
                  <p>Freelancers can showcase their services and get hired</p>
                </div>
                <div className="about-feature">
                  <span className="about-feature-icon">💬</span>
                  <h3>Direct Contact</h3>
                  <p>Connect directly with freelancers to discuss projects</p>
                </div>
                <div className="about-feature">
                  <span className="about-feature-icon">💰</span>
                  <h3>Flexible Payments</h3>
                  <p>Multiple payment options including Cash, GCash, and Bank Transfer</p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>👥 The Team</h2>
              <div className="about-team">
                <div className="team-member">
                  <div className="team-avatar">CB</div>
                  <h3>Carlo Barreo</h3>
                  <p>Developer</p>
                </div>
                <div className="team-member">
                  <div className="team-avatar">DR</div>
                  <h3>Daniel Rebudiao</h3>
                  <p>Developer</p>
                </div>
                <div className="team-member">
                  <div className="team-avatar">FB</div>
                  <h3>Francis Balcruz</h3>
                  <p>Developer</p>
                </div>
                <div className="team-member">
                  <div className="team-avatar">AP</div>
                  <h3>Anna Papa</h3>
                  <p>Developer</p>
                </div>
              </div>
            </section>

            <section className="about-section">
            <h2>📧 Contact Us</h2>
            <p>
                Have questions or feedback? Reach out to our team:
            </p>
            <div className="contact-emails">
                <p>📧 <a href="mailto:carlo_barreo@dlsu.edu.ph">carlo_barreo@dlsu.edu.ph</a></p>
                <p>📧 <a href="mailto:daniel_rebudiao@dlsu.edu.ph">daniel_rebudiao@dlsu.edu.ph</a></p>
                <p>📧 <a href="mailto:francis_balcruz@dlsu.edu.ph">francis_balcruz@dlsu.edu.ph</a></p>
                <p>📧 <a href="mailto:anna_papa@dlsu.edu.ph">anna_papa@dlsu.edu.ph</a></p>
            </div>
            </section>
          </div>

            <section className="about-section">
            <h2>📦 NPM Packages & Third-Party Libraries</h2>
            <p>This project uses the following open-source packages and libraries:</p>
            
            <div className="packages-grid">
                <div className="packages-category">
                <h3>Frontend (client/)</h3>
                <ul className="packages-list">
                    <li><span className="package-name">react</span> <span className="package-version">^18.2.0</span></li>
                    <li><span className="package-name">react-dom</span> <span className="package-version">^18.2.0</span></li>
                    <li><span className="package-name">react-router-dom</span> <span className="package-version">^7.13.1</span></li>
                    <li><span className="package-name">axios</span> <span className="package-version">^1.13.6</span></li>
                    <li><span className="package-name">react-dropzone</span> <span className="package-version">^15.0.0</span></li>
                    <li><span className="package-name">react-scripts</span> <span className="package-version">5.0.1</span></li>
                </ul>
                </div>
                
                <div className="packages-category">
                <h3>Backend (server/)</h3>
                <ul className="packages-list">
                    <li><span className="package-name">express</span> <span className="package-version">^4.22.1</span></li>
                    <li><span className="package-name">mongoose</span> <span className="package-version">^7.8.9</span></li>
                    <li><span className="package-name">bcryptjs</span> <span className="package-version">^2.4.3</span></li>
                    <li><span className="package-name">jsonwebtoken</span> <span className="package-version">^9.0.3</span></li>
                    <li><span className="package-name">cors</span> <span className="package-version">^2.8.5</span></li>
                    <li><span className="package-name">dotenv</span> <span className="package-version">^16.3.1</span></li>
                    <li><span className="package-name">multer</span> <span className="package-version">^2.1.1</span></li>
                    <li><span className="package-name">nodemon</span> <span className="package-version">^3.1.14 (dev)</span></li>
                </ul>
                </div>
            </div>
            
            <p className="packages-note">
                Special thanks to the open-source community for their contributions.
            </p>
            </section>

        </main>

      </div>
    </>
  );
};

export default AboutPage;