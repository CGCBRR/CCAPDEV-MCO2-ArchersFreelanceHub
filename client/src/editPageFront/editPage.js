import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import './editPageStyles/main.css';
import logo2 from './images/logo2.png';
import profile from './images/profile.jpg';

const EditPage = () => {
    const [message, setMessage] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Form states
    const [profileName, setProfileName] = useState("");
    const [tagline, setTagline] = useState("");
    const [userBio, setUserBio] = useState("");
    const [location, setLocation] = useState("");
    const [languages, setLanguages] = useState("");
    
    const navigate = useNavigate(); 

    useEffect(() => {
        const token = localStorage.getItem("token");

        const verifyToken = async () => {
            try {
                await axios.get("http://localhost:5000/api/verify-token", {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setMessage("Access denied. Please login first.");
                    navigate("/");
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
                
                // Populate form fields with existing data
                setProfileName(res.data.username || "");
                setTagline(res.data.tagline || "");
                setUserBio(res.data.bio || "");
                setLocation(res.data.location || "");
                setLanguages(res.data.languages || "");
                
                console.log("Fetched user profile:", res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setMessage("Error fetching profile");
                setLoading(false);
            }
        };
        
        if (token) {
            fetchUserProfile();
        }
    }, [navigate]);

    // Handles profile edit saving
    const handleEditProfile = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            
            // Send updated profile data to backend
            const res = await axios.put("http://localhost:5000/api/update-profile", 
                { 
                    username: profileName,
                    tagline: tagline,
                    bio: userBio,
                    location: location,
                    languages: languages
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                alert("Successfully updated your profile!");
                navigate("/my-projects"); // redirect to profile page
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            setMessage(err.response?.data?.message || "Something went wrong with editing the profile");
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handlePostService = () => {
        navigate("/postservice");
    };

    const handleCancel = () => {
        navigate("/my-projects");
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

    return (
        <>
            <div className="head-container">
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Edit Profile | Archer's Freelance Hub</title>
            </div>
            
            <div className="body-container">
                {/* HEADER */}
                <header className="header">
                    <div className="header-left">
                        <img src={logo2} alt="Logo" className="logo-img"/>
                        <div className="brand-text">
                            <h1 className="logo-text">Archer's Freelance Hub</h1>
                            <span className="badge">DLSU Exclusive</span>
                        </div>
                    </div>

                    <nav className="header-nav">
                        <Link to="/homepage" className="nav-link">
                            Home
                        </Link>
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
                            onClick={() => navigate("/my-projects")}
                            style={{ cursor: "pointer" }}
                        >
                            <img src={userProfile?.profileimage || profile} alt="Profile" />
                            <span className="online-indicator" />
                        </div>
                    </div>
                </header>

                <main>
                    {/* Profile Cover Section */}
                    <section className="profile-cover">
                        <div className="cover-image"></div>
                        
                        <div className="profile-header">
                            <div className="profile-avatar-wrapper">
                                <img 
                                    src={userProfile?.profileimage || profile} 
                                    alt="Profile" 
                                    className="profile-avatar"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Profile Info Section - EDIT MODE */}
                    <section className="profile-info edit-mode">
                        <div className="edit-form-card">
                            {message && <div className="error-message">{message}</div>}
                            
                            {/* Basic Info Section */}
                            <h3 className="edit-section-title">
                                Basic Information
                            </h3>

                            <div className="edit-input-group">
                                <label className="edit-input-label">Full Name</label>
                                <input 
                                    type="text" 
                                    id="profileName" 
                                    className="edit-input" 
                                    value={profileName}
                                    placeholder="Enter your full name..."
                                    onChange={(e) => setProfileName(e.target.value)}
                                />
                                <div className="edit-char-counter"><span>{profileName.length}</span>/100 characters</div>
                            </div>

                            <div className="edit-input-group">
                                <label className="edit-input-label">Tagline</label>
                                <input 
                                    type="text" 
                                    id="profileTagline" 
                                    className="edit-input" 
                                    value={tagline}          
                                    placeholder="Write a short tagline..."
                                    onChange={(e) => setTagline(e.target.value)}
                                />
                                <div className="edit-char-counter"><span>{tagline.length}</span>/100 characters</div>
                            </div>

                            {/* Meta Information Grid */}
                            <div className="edit-meta-grid">
                                <div className="edit-meta-item">
                                    <label className="edit-input-label">Member since</label>
                                    <span className="meta-value">{formatDate(userProfile?.createdAt)}</span>
                                </div>
                                <div className="edit-meta-item">
                                    <label className="edit-input-label">Location</label>
                                    <input 
                                        type="text" 
                                        id="location" 
                                        className="edit-input" 
                                        value={location}          
                                        placeholder="Write your location..."  
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                                <div className="edit-meta-item">
                                    <label className="edit-input-label">Languages</label>
                                    <input 
                                        type="text" 
                                        id="language" 
                                        className="edit-input" 
                                        value={languages}          
                                        placeholder="e.g., English, Filipino, Spanish"
                                        onChange={(e) => setLanguages(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* About Section */}
                            <h3 className="edit-section-title">
                                About
                            </h3>

                            <div className="edit-input-group">
                                <label className="edit-input-label">Biography</label>
                                <textarea 
                                    id="profileBio" 
                                    className="edit-textarea" 
                                    placeholder="Tell your story..."
                                    value={userBio} 
                                    onChange={(e) => setUserBio(e.target.value)}
                                    rows="5"
                                />
                                <div className="edit-char-counter"><span>{userBio.length}</span>/500 characters</div>
                            </div>

                            {/* Preview Card */}
                            <div className="edit-preview-card">
                                <div className="edit-preview-title">Profile Preview</div>
                                <div className="edit-preview-content">
                                    Your profile will be visible to clients and freelancers. Make sure your information is accurate and professional. A complete profile increases your chances of getting hired by 40%.
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="edit-actions">
                                <button 
                                    className="edit-save-btn" 
                                    id="saveBtn" 
                                    onClick={handleEditProfile}
                                >
                                    Save Changes
                                </button>
                                <button 
                                    className="edit-cancel-btn" 
                                    id="cancelBtn" 
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
};

export default EditPage;