import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './'; // Fill this in with the profilePage css files

const profilePage = () => {
    
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
    }, []);

    const handleSignOut = () => {
    localStorage.removeItem("token"); // clear JWT
    navigate("/"); // redirect to login page
  };

    return (
        <>
        <div className="head-container">
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Archer's Freelance Hub | Find DLSU Talent</title>
        </div>

        <div className="body-container">
            {/* HEADER */}
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
                <Link to="/homepage" className="nav-link">
                    Home
                </Link>
                <Link to="/profile" className="nav-link">
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
                    <img src={profile} alt="Profile" />
                    <span className="online-indicator" />
                </div>
                </div>
            </header>

            <main>
                {/*Profile Cover Section -->*/}
                <section class="profile-cover">
                    <div class="cover-image"></div>
                    
                    <div class="profile-header">
                        <div class="profile-avatar-wrapper">
                            <img src="../../images/jb.jpg" alt="Jean-Baptist De La Salle" class="profile-avatar"/>
                        </div>
                        {/*<!-- Container for both button groups --> */}
                        
                        <div class="profile-header-right">
                            {/*<!-- Admin Button in its own container --> */}
                            
                            <div class="profile-actions admin-container">
                                <button class="btn-admin" onclick="window.location.href='admin-dashboard.html'">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                    Admin
                                </button>
                            </div>

                            {/*<!-- Edit Profile and Share in their own container --> */}
                            <div class="profile-actions">
                                <button class="btn-primary" id="editBtn">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M13 7L9 11L5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    Edit Profile
                                </button>
                                <button class="btn-secondary">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M14 10V14C14 15.1 13.1 16 12 16H4C2.9 16 2 15.1 2 14V6C2 4.9 2.9 4 4 4H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                        <path d="M10 2H16V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                        <path d="M8 10L16 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    </svg>
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* <!-- Profile Info Section -->*/}
                <section class="profile-info" >
                    <div class="info-main">
                        <h1 class="profile-name" id="profileName">{userProfile.username}</h1>
                        <p class="profile-tagline" id="profileTagline">tagline :|</p>
                        
                        <div class="profile-meta">
                            <div class="meta-item">
                                <span class="meta-label">Member since</span>
                                <span class="meta-value">{user.createdAt}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Location</span>
                                <span class="meta-value" id="location">Manila, Philippines</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Languages</span>
                                <span class="meta-value"id="language">English, Filipino</span>
                            </div>
                        </div>
                    </div>

                    <div class="profile-stats">
                        <div class="stat-card">
                            <span class="stat-number"id="projectNum">{userProfile.totalprojects}</span>
                            <span class="stat-label">Projects</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number"id="ratingNum">{userProfile.averagerating}</span>
                            <span class="stat-label">Rating</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">234</span>
                            <span class="stat-label">Followers</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">89</span>
                            <span class="stat-label">Following</span>
                        </div>
                    </div>

                    <div class="profile-bio" >
                        <h3>About</h3>
                        <p id = "profileBio">{userProfile.bio}</p>
                    </div>
                </section>

                {/*<!-- Skills Section --> */}
                <section class="skills-section">
                    <div class="section-header">
                        <h2 class="section-title">Skills & Expertise</h2>
                        <a href="#" class="view-all">Add skills +</a>
                    </div>
                    
                    <div class="skills-grid">
                        <span class="skill-tag">Curriculum Design</span>
                        <span class="skill-tag">Educational Leadership</span>
                        <span class="skill-tag">Teacher Training</span>
                        <span class="skill-tag">Program Development</span>
                        <span class="skill-tag">Academic Writing</span>
                        <span class="skill-tag">Mentoring</span>
                    </div>
                </section>

                {/* <!-- Portfolio/Posts Section -->*/}
                <section class="portfolio-section"id="portfolioSect">
                    <div class="section-header">
                        <div>
                            <span class="section-tag">PORTFOLIO</span>
                            <h2 class="section-title">Art Projects</h2>
                        </div>
                        <div class="filter-tabs">
                            <button class="filter-tab active">All</button>
                            <button class="filter-tab">Art</button>
                            <button class="filter-tab">Design</button>
                            <button class="filter-tab">Crafts</button>
                        </div>
                    </div>

                    <div class="portfolio-grid">
                        {/*<!-- Project Card 1 -->*/}
                        <div class="project-card">
                            <div class="project-image">
                                <img src="https://i.etsystatic.com/8375113/r/il/1ef2bd/3567850704/il_fullxfull.3567850704_cm4w.jpg" alt="Crochet Project"/>
                                <span class="project-category">Art</span>
                            </div>
                            <div class="project-content">
                                <h3 class="project-title">Handmade Crochet Collection</h3>
                                <div class="project-rating">
                                    <span class="stars">★★★★★</span>
                                    <span class="rating-count">(10 reviews)</span>
                                </div>
                                <p class="project-description">Custom crochet items including amigurumi, blankets, and accessories. Made with premium materials.</p>
                                <div class="project-footer">
                                    <span class="project-price">₱20 - ₱500</span>
                                    <button class="project-action">View Details →</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="load-more">
                        <button class="load-more-btn">Load More Projects</button>
                    </div>
                </section>

                {/* <!-- Reviews Section -->*/}
                <section class="reviews-section">
                    <div class="section-header">
                        <h2 class="section-title">Client Reviews</h2>
                        <a href="#" class="view-all">View all 156 reviews →</a>
                    </div>

                    <div class="reviews-grid">
                        <div class="review-card">
                            <div class="review-header">
                                <img src="https://thumbs.dreamstime.com/b/monkey-portrait-2016188.jpg" alt="Client" class="reviewer-avatar"/>
                                <div>
                                    <h4 class="reviewer-name">Maria Santos</h4>
                                    <p class="review-date">March 2024</p>
                                </div>
                                <span class="review-rating">★★★★★</span>
                            </div>
                            <p class="review-text">"Amazing attention to detail! The crochet pieces exceeded my expectations. Will definitely order again."</p>
                        </div>
                    </div>
                    
                </section>
            </main>
        </div>
        </>
    );
}


export default profilePage;