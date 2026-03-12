import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./homePageStyles/main.css"
import logo2 from './images/logo2.png';
import profile from "./images/profile.jpg";
import heroImage from "./images/hero-image.png";

const Homepage = () => {
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [statistics, setStatistics] = useState({
    totalActiveUsers: 0,
    totalServices: 0,
    averageRating: 0
  });
  const [freelancers, setFreelancers] = useState([]);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const verifyToken = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // setMessage(res.data.message);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setMessage("Access denied. Please login first.");
          navigate("/"); // redirect to login page
        } else {
          setMessage("Something went wrong.");
        }
      }
    };
    verifyToken();

    // Fetch user profile data 
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/get-profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data);
        console.log("Fetched user profile:", res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUserProfile();

    // Fetch statistics data
    const fetchStatistics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/get-statistics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatistics(res.data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
      }
    };
    fetchStatistics();

    // Fetch lists of freelancers ordered by rating, earned, and projects completed (for featured section)
    const fetchFreelancers = async () => {
        try {
        const rest = await axios.get("http://localhost:5000/api/get-freelancers", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setFreelancers(rest.data);
        } catch (err) {
        console.error("Error fetching freelancers:", err);
        }
    };
    fetchFreelancers();

    // Fetch lists of freelancers ordered by rating, earned, and projects completed (for featured section)
    const fetchServices = async () => {
        try {
        const rest = await axios.get("http://localhost:5000/api/get-services", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setServices(rest.data);
        } catch (err) {
        console.error("Error fetching services:", err);
        }
    };
    fetchServices();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token"); // clear JWT
    navigate("/"); // redirect to login page
  };

  const handlePostService = () => {
    navigate("/postservice"); // redirect to post service page
  };

  const openPopup = () => {
  };
  
  const closePopup = () => { 
  };

  return (
    <>
      <div className="head-container">
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Archer's Freelance Hub | Find DLSU Talent</title>
      </div>

      <div className="body-container">
        <header className="header">
          <div className="header-left">
            <img
              src={logo2}
              alt="Archer's Freelance Hub"
              className="logo-img"
            />
            <div className="brand-text">
              <h1 className="logo-text">Archer's Freelance Hub</h1>
              <span className="badge">DLSU Exclusive</span>
            </div>
          </div>
          <nav className="header-nav">
            <a href="homepage.html" className="nav-link active">
              Browse
            </a>
            <Link to="/my-projects" className="nav-link">
              My Projects
            </Link>
          </nav>
          <div className="header-right">
            <button
              className="post-btn"
              onClick={handlePostService}
            >
              + Post Services
            </button>
            <button
              className="logout-btn"
              onClick={handleSignOut}
            >
              Log out
            </button>
            <div
              className="profile-icon"
              onClick={() => (window.location.href = "profile.html")}
              style={{ cursor: "pointer" }}
            >
              <img src={userProfile?.profileimage || profile} alt="Profile" />
              <span className="online-indicator" />
            </div>
          </div>
        </header>

        <div className="message">{message}</div>

        <main className="main-container">
          <section className="hero-section">
            <div className="hero-container">
              <div className="hero-content">
                <span className="hero-tag">🎓 DLSU's #1 Freelance Platform</span>
                <h2 className="hero-title">
                  Where <span className="highlight">DLSU talents</span>
                  <br />
                  meet real-world opportunities
                </h2>
                <p className="hero-subtitle">
                  Connect with top students and alumni for your next project. From
                  creative arts to technical expertise, find the perfect match.
                </p>

                <div className="search-container">
                  <div className="search-wrapper">
                    <svg
                      className="search-icon"
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 19L15 15"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search for services..."
                    />
                  </div>
                  <button className="search-btn">Search</button>
                </div>

                <div className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-number">{statistics.totalActiveUsers}</span>
                    <span className="stat-label">Active Freelancers</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <span className="stat-number">{statistics.totalServices}</span>
                    <span className="stat-label">Projects Completed</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <span className="stat-number">{statistics.averageRating}</span>
                    <span className="stat-label">Average Rating</span>
                  </div>
                </div>
              </div>

              <div className="hero-image">
                <img src={heroImage} alt="DLSU School" />
                <div className="hero-shape" />
              </div>
            </div> { /* END HERO CONTAINER */ }
          </section>

          {/* EXPLORE CATEGORIES */}
          <section className="categories-section">
            <div className="section-header">
              <div>
                <span className="section-tag">EXPLORE</span>
                <h2 className="section-title">Browse by category</h2>
              </div>
            </div>
            <div className="categories-wrapper">
              <div className="categories-grid">
                <button className="category-card" onClick={() => (window.location.href = 'categories.html')}>
                    <div className="category-icon">🎨</div>
                    <h3>Visual Arts</h3>
                    <p>Design, illustration, photography</p>
                </button>
                <button className="category-card" onClick={() => (window.location.href = 'categories.html')}>
                    <div className="category-icon">📚</div>
                    <h3>Academic Help</h3>
                    <p>Tutoring, research, editing</p>
                </button>
                <button className="category-card" onClick={() => (window.location.href = 'categories.html')}>
                    <div className  ="category-icon">🎬</div>
                    <h3>Video Editing</h3>
                    <p>Production, post-processing</p>
                </button>
                <button className="category-card" onClick={() => (window.location.href = 'categories.html')}>
                    <div className="category-icon">💻</div>
                    <h3>Programming</h3>
                    <p>Web, mobile, software</p>
                </button>
                <button className="category-card" onClick={() => (window.location.href = 'categories.html')}>
                    <div className  ="category-icon">📊</div>
                    <h3>Marketing</h3>
                    <p>Social media, SEO, content</p>
                </button>
                <button className="category-card" onClick={() => (window.location.href = 'categories.html')}>
                    <div className="category-icon">🏢</div>
                    <h3>Business</h3>
                    <p>Market planning, Data Entry, Market Analysis</p>
                </button>
                <button className="category-card" onClick={() => (window.location.href = 'categories.html')}>
                    <div className  ="category-icon">📷</div>
                    <h3>Physical Services</h3>
                    <p>Host, photographer, designer</p>
                </button>
              </div>
            </div>
          </section>

          {/* FEATURED FREELANCERS */}
          <section className="featured-section">
            <div className="section-header">
              <div>   
                <span className="section-tag">FEATURED</span>
                <h2 className="section-title">Top freelancers this week</h2>
              </div>
              <a href="#" className="view-all">View all →</a>
            </div>

            <div className="freelancers-grid">
                {/* Loop through all Freelancers */}
                {freelancers.map((freelancer, index) => (
                    <div key={index} className="freelancer-card" onClick={() => openPopup()}>
                        <div className="card-header">
                            <div className="user-info">
                                <img src={freelancer.profileimage || profile} alt={freelancer.userid.username} className="user-avatar" />
                                <div>
                                    <h3 className="user-name">{freelancer.firstname} {freelancer.lastname}</h3>
                                    <p className="user-meta">{freelancer.userid.username}</p>
                                </div>
                            </div>
                        </div>

                        <div className="stats-row">
                            <div className="stat">
                                <span className="stat-value">${freelancer.totalearned.toFixed(2)}</span>
                                <span className="stat-label">Earned</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{freelancer.totalprojects}</span>
                                <span className="stat-label">Projects</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{freelancer.averagerating.toFixed(2)}</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>

                        <p className="freelancer-bio">
                            {freelancer.bio || "No bio available."}
                        </p>

                        {/* Portfolio images - for demo purposes, using static images */}
                        { /* Loop through freelancer's projects and display their images here. */ }
                        <div className="portfolio-grid">
                            {freelancer.projects.map((project, idx) => (
                                <img key={idx} src={project.projectimages[0]} alt={"No Project Portfolio"} />
                            ))}
                        </div>

                        <div className="card-actions">
                            <button className="action-btn hire-btn" onClick={(e) => {
                                e.stopPropagation();
                                // Your hire logic here
                            }}>
                                Hire Now
                            </button>
                        </div> 
                    </div>
                ))}
            </div>
          </section>

          {/* FEATURED SERVICES */}
          <section className="featured-section">
            <div className="section-header">
              <div>   
                <span className="section-tag">FEATURED</span>
                <h2 className="section-title">Top services this week</h2>
              </div>
              <a href="#" className="view-all">View all →</a>
            </div>

            <div className="freelancers-grid">
                {/* Loop through all Freelancers */}
                {services.map((service, index) => (
                    <div key={index} className="freelancer-card" onClick={() => openPopup()}>
                        <div className="card-header">
                            <div className="user-info">
                                <img src={service.image || profile} alt={service.userid.username} className="user-avatar" />
                                <div>
                                    <h3 className="user-name">{service.title}</h3>
                                    <p className="user-meta">{service.userid.username}</p>
                                </div>
                            </div>
                        </div>

                        <div className="stats-row">
                            <div className="stat">
                                <span className="stat-value">${service.startingprice.toFixed(2)}</span>
                                <span className="stat-label">Price</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{service.category}</span>
                                <span className="stat-label">Category</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{service.deliverytime}</span>
                                <span className="stat-label">Delivery Time</span>
                            </div>
                        </div>

                        <p className="freelancer-bio">
                            {service.description || "No description available."}
                        </p>

                        {/* Portfolio images - for demo purposes, using static images */}
                        { /* Loop through freelancer's projects and display their images here. */ }
                        <div className="portfolio-grid">
                            <img key={index} src={service.image} alt={"No Work Samples"} />
                        </div>

                        <div className="card-actions">
                            <button className="action-btn hire-btn" onClick={(e) => {
                                e.stopPropagation();
                                // Your hire logic here
                            }}>
                                Hire Now
                            </button>
                        </div> 
                    </div>
                ))}
            </div>
          </section>
        </main>
      </div> {/* END BODY CONTAINER */ }
    </>
  );
};

export default Homepage;