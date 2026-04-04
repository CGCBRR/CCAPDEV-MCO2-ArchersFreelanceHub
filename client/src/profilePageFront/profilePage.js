import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./profilePageStyles/main.css"
import logo2 from './images/logo2.png';
import profile from "./images/profile.jpg";

const ProfilePage = () => {
    
    const [message, setMessage] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [userServices, setUserServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 
    const [isAdmin, setIsAdmin] = useState(false);

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

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
        const res = await axios.get("http://localhost:5000/api/get-profile", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data);
        setUser({
            createdAt: res.data.createdAt || new Date().toLocaleDateString(),
            ...res.data
        });
        
        // Check if user is admin (based on email)
        const adminEmails = [
            'carlo_barreo@dlsu.edu.ph',
            'daniel_rebudiao@dlsu.edu.ph',
            'francis_balcruz@dlsu.edu.ph',
            'anna_papa@dlsu.edu.ph'
        ];
        setIsAdmin(adminEmails.includes(res.data.email));
        
        console.log("Fetched user profile:", res.data);
        } catch (err) {
            console.error("Error fetching user profile:", err);
            setMessage("Error fetching profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserServices = async () => {
        setServicesLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/api/get-my-services", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserServices(res.data);
            console.log("Fetched user services:", res.data);
        } catch (err) {
            console.error("Error fetching user services:", err);
        } finally {
            setServicesLoading(false);
        }
    };

    verifyToken();
    fetchUserProfile();
    fetchUserServices();
}, [navigate]);

const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
};

const handlePostService = () => {
    navigate("/postservice");
};

const handleEditProfile = () => {
    navigate("/edit-profile");
};

const handleShareProfile = () => {
    const profileUrl = window.location.href;
    navigator.clipboard.writeText(profileUrl)
        .then(() => alert("Profile link copied to clipboard!"))
        .catch(() => alert("Failed to copy link"));
};

const handleAdminDashboard = () => {
    navigate("/admin-dashboard");
};

const handleEditService = (serviceId) => {
    navigate(`/edit-service/${serviceId}`);
};

const handleDeleteService = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/delete-service/${serviceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserServices(userServices.filter(service => service._id !== serviceId));
        } catch (err) {
            console.error("Error deleting service:", err);
            alert("Failed to delete service");
        }
    }
};

const formatDate = (dateString) => {
    if (!dateString) return "Recent";
    return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
    });
};

// Helper function to get payment method emoji
const getPaymentEmoji = (method) => {
    switch(method) {
        case 'Cash': return '💵';
        case 'GCash': return '📱';
        case 'Bank Transfer': return '🏦';
        default: return '💰';
    }
};

if (loading) {
    return (
        <div className="loading-container">
            <div className="loading-spinner">Loading profile...</div>
        </div>
    );
}

if (!userProfile) {
    return (
        <div className="error-container">
            <div className="error-message">Failed to load profile</div>
            <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
    );
}

    return (
        <>
        <div className="head-container">
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
                    <img 
                        src={userProfile?.profileimage || 'http://localhost:5000/assets/default-avatar.jpg'} 
                        alt="Profile" 
                        className="profile-avatar"
                    />
                    <span className="online-indicator" />
                </div>
                </div>
            </header>

            <main>
                {/*Profile Cover Section */}
                <section className="profile-cover">
                    <div className="cover-image"></div>
                    
                    <div className="profile-header">
                        <div className="profile-avatar-wrapper">
                            <img 
                                src={userProfile?.profileimage || 'http://localhost:5000/assets/default-avatar.jpg'} 
                                alt="Profile" 
                                className="profile-avatar"
                            />
                        </div>
                        
                        <div className="profile-header-right">
                            
                            {/* Admin Button - Only show for admin users */}
                            {isAdmin && (
                                <div className="profile-actions admin-container">
                                    <button 
                                        className="btn-admin" 
                                        onClick={handleAdminDashboard}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                        Admin
                                    </button>
                                </div>
                            )}

                            {/* Edit Profile and Share */}
                            <div className="profile-actions">
                                <button 
                                    className="btn-primary" 
                                    id="editBtn"
                                    onClick={handleEditProfile}
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M13 7L9 11L5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Edit Profile
                                </button>
                                <button 
                                    className="btn-secondary"
                                    onClick={handleShareProfile}
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M14 10V14C14 15.1 13.1 16 12 16H4C2.9 16 2 15.1 2 14V6C2 4.9 2.9 4 4 4H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        <path d="M10 2H16V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        <path d="M8 10L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Profile Info Section */}
                <section className="profile-info" >
                    <div className="info-main">
                        <h1 className="profile-name" id="profileName">{userProfile.username}</h1>
                        <p className="profile-tagline" id="profileTagline">
                            {userProfile.tagline || "No tagline yet"}
                        </p>
                        
                        <div className="profile-meta">
                            <div className="meta-item">
                                <span className="meta-label">Member since</span>
                                <span className="meta-value">{formatDate(user?.createdAt)}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Location</span>
                                <span className="meta-value" id="location">
                                    {userProfile?.location || "Manila, Philippines"}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Languages</span>
                                <span className="meta-value" id="language">
                                    {userProfile?.languages || "English, Filipino"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-stats">
                        <div className="stat-card">
                            <span className="stat-number" id="projectNum">
                                {userProfile.totalprojects || 0}
                            </span>
                            <span className="stat-label">Projects</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number" id="ratingNum">
                                {userProfile.averagerating.toFixed(1) || 0}
                            </span>
                            <span className="stat-label">Rating</span>
                        </div>
                    </div>

                    <div className="profile-bio" >
                        <h3>About</h3>
                        <p id="profileBio">
                            {userProfile.bio || "No bio yet."}
                        </p>
                    </div>

                    {/* Payment Methods Section */}
                    {userProfile.paymentMethods && userProfile.paymentMethods.length > 0 && (
                        <div className="profile-payment-section">
                            <h3>Accepted Payment Methods</h3>
                            <div className="payment-methods-display">
                                {userProfile.paymentMethods.map((method, index) => (
                                    <span key={index} className="payment-method-badge">
                                        {getPaymentEmoji(method)} {method}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Information Section */}
                    {userProfile.contactInfo && (
                        <div className="profile-contact-section">
                            <h3>Contact Information</h3>
                            <div className="contact-info-display">
                                {userProfile.contactInfo.facebook && (
                                    <div className="contact-item">
                                        <span className="contact-icon">📘</span>
                                        <a href={userProfile.contactInfo.facebook} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           className="contact-link">
                                            {userProfile.contactInfo.facebook}
                                        </a>
                                    </div>
                                )}
                                {userProfile.contactInfo.email && (
                                    <div className="contact-item">
                                        <span className="contact-icon">📧</span>
                                        <a href={`mailto:${userProfile.contactInfo.email}`}
                                           className="contact-link">
                                            {userProfile.contactInfo.email}
                                        </a>
                                    </div>
                                )}
                                {userProfile.contactInfo.phone && (
                                    <div className="contact-item">
                                        <span className="contact-icon">📞</span>
                                        <a href={`tel:${userProfile.contactInfo.phone}`}
                                           className="contact-link">
                                            {userProfile.contactInfo.phone}
                                        </a>
                                    </div>
                                )}
                                {userProfile.contactInfo.other && (
                                    <div className="contact-item">
                                        <span className="contact-icon">💬</span>
                                        <span className="contact-text">{userProfile.contactInfo.other}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Portfolio/Posts Section */}
                <section className="portfolio-section" id="portfolioSect">
                    <div className="section-header">
                        <div>
                            <span className="section-tag">PORTFOLIO</span>
                            <h2 className="section-title">My Services</h2>
                        </div>
                        <button className="post-btn" onClick={handlePostService}>
                            + Add New Service
                        </button>
                    </div>

                        {servicesLoading ? (
                            <div className="loading-spinner">Loading services...</div>
                        ) : userServices.length === 0 ? (
                            <div className="no-services">
                                <p>You haven't posted any services yet.</p>
                                <button className="post-btn" onClick={handlePostService}>
                                    Post Your First Service
                                </button>
                            </div>
                        ) : (
                            <div className="portfolio-grid">
                                {userServices.map((service) => (
                                    <div className="project-card" key={service._id}>
                                        <div className="project-image">
                                            <img 
                                                src={service.image?.[0] || "https://via.placeholder.com/300"} 
                                                alt={service.title}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/300";
                                                }}
                                            />
                                            <span className="project-category">{service.category}</span>
                                        </div>
                                        <div className="project-content">
                                            <h3 className="project-title">{service.title}</h3>
                                            <div className="service-meta">
                                                <span className="service-price">₱{service.startingprice} | </span>
                                                <span className="service-price-type">{service.pricetype} | </span>
                                                <span className="service-delivery">• {service.deliverytime}</span>
                                            </div>
                                            <p className="project-description">
                                                {service.description.length > 100 
                                                    ? `${service.description.substring(0, 100)}...` 
                                                    : service.description}
                                            </p>
                                            <div className="service-experience">
                                                Experience: {service.experiencelevel}
                                            </div>
                                            <div className="project-footer">
                                                <button 
                                                    className="project-action"
                                                    onClick={() => handleEditService(service._id)}
                                                >
                                                    Edit Service
                                                </button>
                                                <button 
                                                    className="project-action delete"
                                                    onClick={() => handleDeleteService(service._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                {/* Reviews Section */}
                <section className="reviews-section">
                    <div className="section-header">
                        <h2 className="section-title">Client Reviews</h2>
                        <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>
                            View all 156 reviews →
                        </a>
                    </div>

                    <div className="reviews-grid">
                        <div className="review-card">
                            <div className="review-header">
                                <img src="https://thumbs.dreamstime.com/b/monkey-portrait-2016188.jpg" alt="Client" className="reviewer-avatar"/>
                                <div>
                                    <h4 className="reviewer-name">Maria Santos</h4>
                                    <p className="review-date">March 2024</p>
                                </div>
                                <span className="review-rating">★★★★★</span>
                            </div>
                            <p className="review-text">"Amazing attention to detail! The crochet pieces exceeded my expectations. Will definitely order again."</p>
                        </div>
                    </div>
                    
                </section>
            </main>
        </div>
        </>
    );
}

export default ProfilePage;