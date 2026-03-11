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
        
        <div class="body-container">
                {/*<<!-- HEADER -->*/}
            <header class="header">
                <div class="header-left">
                    <img src="../../images/logo2.png" alt="Archer's Freelance Hub" class="logo-img"/>
                    <div class="brand-text">
                        <h1 class="logo-text">Archer's Freelance Hub</h1>
                        <span class="badge">DLSU Exclusive</span>
                    </div>
                </div>

                <nav class="header-nav">
                    <Link to="/homepage" className="nav-link">
                        Home
                    </Link>
                    <Link to="/profile" className="nav-link">
                        My Projects
                    </Link>
                </nav>

                <div class="header-right">
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
                {/*<!-- Profile Cover Section -->*/}
                <section class="profile-cover">
                    <div class="cover-image"></div>
                    
                    <div class="profile-header">
                        <div class="profile-avatar-wrapper">
                            <img src="../../images/jb.jpg" alt="Jean-Baptist De La Salle" class="profile-avatar"/>
                        </div>
                    </div>
                </section>

                {/*<!-- Profile Info Section - EDIT MODE -->*/}
                <section class="profile-info edit-mode">
                    <div class="edit-form-card">
                        {/*<!-- Basic Info Section -->*/}
                        <h3 class="edit-section-title">
                            Basic Information
                        </h3>

                        <div class="edit-input-group">
                            <label class="edit-input-label">Full Name</label>
                            <input 
                             type="text" 
                             id="profileName" 
                             class="edit-input" 
                             value={userProfile.userName}
                             placeholder="Enter your full name"
                             />
                            <div class="edit-char-counter"><span>23</span>/100 characters</div>
                        </div>

                        <div class="edit-input-group">
                            <label class="edit-input-label">Tagline</label>
                            <input 
                             type="text" 
                             id="profileTagline" 
                             class="edit-input" 
                          // value= {TEMPORARY_FILL_WITH_CORRECT_DB_FIELD}          
                             placeholder="Write a short tagline"
                             />
                            <div class="edit-char-counter"><span>78</span>/100 characters</div>
                        </div>

                        {/*<!-- Meta Information Grid -->*/}
                        <div class="edit-meta-grid">
                            <div class="edit-meta-item">
                                <label class="edit-input-label">Member since</label>
                                <span class="meta-value">January 2024</span>
                            </div>
                            <div class="edit-meta-item">
                                <label class="edit-input-label">Location</label>
                                <input 
                                 type="text" 
                                 id="location" 
                                 class="edit-input" 
                                 placeholder="2401 Taft Avenue, Malate, Manila, 1004 Philippines"
                              // value= {TEMPORARY_FILL_WITH_CORRECT_DB_FIELD}  
                                 />
                            </div>
                            <div class="edit-meta-item">
                                <label class="edit-input-label">Languages</label>
                                <input 
                                 type="text" 
                                 id="language" 
                                 class="edit-input" 
                              // value= {TEMPORARY_FILL_WITH_CORRECT_DB_FIELD}  
                                 />
                            </div>
                        </div>

                        {/*<!-- About Section -->*/}
                        <h3 class="edit-section-title">
                            About
                        </h3>

                        <div class="edit-input-group">
                            <label class="edit-input-label">Biography</label>
                            <textarea id="profileBio" class="edit-textarea" placeholder="Tell your story...">Passionate educator with over 20 years of experience in curriculum development and educational leadership. Founder of multiple learning initiatives and dedicated to fostering academic excellence in the DLSU community.</textarea>
                            <div class="edit-char-counter"><span>187</span>/500 characters</div>
                        </div>

                        {/*<!-- Preview Card -->*/}
                        <div class="edit-preview-card">
                            <div class="edit-preview-title">Profile Preview</div>
                            <div class="edit-preview-content">
                                Your profile will be visible to clients and freelancers. Make sure your information is accurate and professional. A complete profile increases your chances of getting hired by 40%.
                            </div>
                        </div>

                        {/*<!-- Action Buttons -->*/}
                        <div class="edit-actions">
                            <button class="edit-save-btn" id="saveBtn" onclick="window.location.href='profile.html'">
                                Save Changes
                            </button>
                            <button class="edit-cancel-btn" id="cancelBtn" onclick="window.location.href='profile.html'">
                                Cancel
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </>
    );

}