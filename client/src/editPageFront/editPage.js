import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './editPageStyles/main.css'; // Fill this in with the profilePage css files
import logo2 from './images/logo2.png';
import profile from './images/profile.jpg';

const editPage = () => {
    const [message, setMessage] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPicture, setUserPicture]  = useState();
    const [username, setUsername] = useState("");
    const [tagline, setTagline] = useState("");
    const [userBio, setUserBio] = useState("");
    const [userLocation, setUserLocation] = useState("");
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

    // Handles profile edit saving
    const handleEditService = async (e) => {
        e.preventDefault(); // prevent page reload

        try {
        // Send registration data to backend
        const res = await axios.findOneAndUpdate("http://localhost:5000/api/get-profile"// <---- add something else aside from addservice, 
            { 
            // profileImge: 
            username: profileName,
            bio: profileBio,
            tagline: profileTagline,
            location: location
            },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }},
        );

        setMessage(""); // clear any previous messages
        alert("Succesfully updated your profile! Your profile is now changed.");
        navigate("/homepage"); // redirect to homepage
        } catch (err) {
        setMessage(err.response?.data?.message || "Something went wrong with editing the profile");
        }
    }

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

    const formatDate = (dateString) => {
        if (!dateString) return "Recent";
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    };

    if (loading) {
    return (
            <div className="loading-container">
                <div className="loading-spinner">Loading edit profile...</div>
            </div>
        );
    }

// SHOW ERROR IF NO PROFILE
    if (!userProfile) {
        return (
            <div className="error-container">
                <div className="error-message">Failed to load edit profile</div>
                <button onClick={() => window.location.reload()}>Refresh</button>
            </div>
        );
    }

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
                    <img src={logo2}/>
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
                             placeholder="Enter your full name..."
                             onChange={(e) => setName(e.target.value)}
                             />
                            <div class="edit-char-counter"><span>23</span>/100 characters</div>
                        </div>

                        <div class="edit-input-group">
                            <label class="edit-input-label">Tagline</label>
                            <input 
                             type="text" 
                             id="profileTagline" 
                             class="edit-input" 
                             value= {userProfile.tagline}          
                             placeholder="Write a short tagline..."
                             onChange={(e) => setTagline(e.target.value)}
                             />
                            <div class="edit-char-counter"><span>78</span>/100 characters</div>
                        </div>

                        {/*<!-- Meta Information Grid -->*/}
                        <div class="edit-meta-grid">
                            <div class="edit-meta-item">
                                <label class="edit-input-label">Member since</label>
                                <span class="meta-value">{formatDate(userProfile?.createdAt)}</span>
                            </div>
                            <div class="edit-meta-item">
                                <label class="edit-input-label">Location</label>
                                <input 
                                 type="text" 
                                 id="location" 
                                 class="edit-input" 
                                 value= {userProfile.location}          
                                 placeholder="Write your location..."  
                                 onChange={(e) => setLocation(e.target.value)}
                                 />
                            </div>
                            <div class="edit-meta-item">
                                <label class="edit-input-label">Languages</label>
                                <input 
                                 type="text" 
                                 id="language" 
                                 class="edit-input" 
                                 value= {userProfile.language}          
                                 placeholder="Write the languages you speak..."
                                 onChange={(e) => setLanguage(e.target.value)}
                                 />
                            </div>
                        </div>

                        {/*<!-- About Section -->*/}
                        <h3 class="edit-section-title">
                            About
                        </h3>

                        <div class="edit-input-group">
                            <label class="edit-input-label">Biography</label>
                            <textarea 
                            id="profileBio" 
                            class="edit-textarea" 
                            placeholder="Tell your story..."
                            value= {userProfile.bio} 
                            onChange={(e) => setBio(e.target.value)}
                            />
                            
                            <div class="edit-char-counter"><span>{profileBio.length}</span>/500 characters</div>
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
                            <button class="edit-save-btn" id="saveBtn" onClick={handleEditService}>
                                Save Changes
                            </button>
                            <button class="edit-cancel-btn" id="cancelBtn" onClick="window.location.href='profile.html'">
                                Cancel
                            </button>
                        </div>sup loser
                    </div>
                </section>
            </main>
        </div>
    </>
    );

}