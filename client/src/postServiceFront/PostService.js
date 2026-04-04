import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import './postServiceStyles/main.css';
import logo2 from './images/logo2.png';
import profile from './images/profile.jpg';

const PostService = () => {
  const [message, setMessage] = useState("");
  const [serviceTitle, setserviceTitle] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [deliveryTime, setDeliveryTime] = useState("1-2");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [workSamples, setWorkSamples] = useState([]);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(""); // clear any previous messages
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
  }, [navigate]);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/public/categories", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { name: 'Visual Arts', icon: '🎨' },
          { name: 'Academic Help', icon: '📚' },
          { name: 'Video Editing', icon: '🎬' },
          { name: 'Programming', icon: '💻' },
          { name: 'Marketing', icon: '📊' },
          { name: 'Music & Audio', icon: '🎵' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token"); // clear JWT
    navigate("/"); // redirect to login page
  };

  const handleHomepage = () => {
    navigate("/homepage"); // redirect to homepage
  };

  const handlePostService = async (e) => {
    e.preventDefault(); // prevent page reload

    try {
        // Send registration data to backend
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("title", serviceTitle);
        formData.append("category", serviceCategory);
        formData.append("description", serviceDesc);
        formData.append("startingprice", Number(startingPrice));
        formData.append("pricetype", priceType);
        formData.append("deliverytime", deliveryTime);
        formData.append("experiencelevel", experienceLevel);

        // append multiple images
        workSamples.forEach((file) => {
            formData.append("images", file);
        });

        const res = await axios.post("http://localhost:5000/api/addservice", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
        });

        setMessage(""); // clear any previous messages
        alert("Succesfully posted your service! It will now be visible to potential clients.");
        navigate("/homepage"); // redirect to homepage
    } catch (err) {
        setMessage(err.response?.data?.message || "Something went wrong");
    }
  }

  const handleCancel = () => {
    navigate("/homepage"); // redirect to homepage
  };

  const onDrop = (acceptedfiles) => {
    const mappedFiles = acceptedfiles.map((file) =>
        Object.assign(file, {
            preview: URL.createObjectURL(file),
        })
    );
    setWorkSamples((prev) => [...prev, ...mappedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
    multiple: true,
  });

  const removeFile = (fileName) => {
    setWorkSamples((prevFiles) => prevFiles.filter(file => file.name !== fileName));
  };


  const uploadFiles = async () => {
    const formData = new FormData();
    workSamples.forEach((file) => {
        formData.append("images", file);
    });
    await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
  }

  return (
    <>
        <title>Archer's Freelance Hub | Post Service</title>

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
                onClick={() => navigate("/my-projects")}
                style={{ cursor: "pointer" }}
            >
                <img src={profile} alt="Profile" />
                <span className="online-indicator" />
            </div>
            </div>
        </header>
        <main>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Post a Service</h1>
                    <p className="page-subtitle">
                    Showcase your skills and start getting hired by DLSU clients
                    </p>
                </div>
                <div className="badge freelancer-badge">🎓 Freelancer Mode</div>
            </div>
            
            {/* Post Service Form */}
            <section className="post-service-section">
                <div className="post-form-card">
                    {/* Service Title */}
                    <div className="form-section">
                        <h3 className="form-section-title">
                            Service Title <span className="required">*</span>
                        </h3>
                        <div className="form-group">
                            <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., I will design a professional logo for your business"
                            value={serviceTitle}
                            onChange={(e) => setserviceTitle(e.target.value)}   
                            />
                            <div className="char-counter">
                                <span>48</span>/100 characters
                            </div>
                        </div>
                    </div>

                    {/* Service Category - Dynamic from Database */}
                    <div className="form-section">
                        <h3 className="form-section-title">
                            Service Category <span className="required">*</span>
                        </h3>
                        <div className="form-group">
                            <select className="form-select"
                                id="serviceCategory"
                                value={serviceCategory}
                                onChange={(e) => setServiceCategory(e.target.value)}
                                required
                            >
                                <option value="" disabled>
                                    Select a category
                                </option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category.name}>
                                        {category.icon} {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Service Description */}
                    <div className="form-section">
                        <h3 className="form-section-title">
                            Service Description <span className="required">*</span>
                        </h3>
                        <div className="form-group">
                            <textarea
                            className="form-textarea"
                            placeholder="Describe the service you're offering in detail..."
                            value={serviceDesc}
                            onChange={(e) => setServiceDesc(e.target.value)}    
                            />
                            <div className="char-counter">
                            <span>324</span>/2000 characters
                            </div>
                        </div>
                    </div>

                    {/* Service Details Grid */}
                    <div className="form-section">
                        <h3 className="form-section-title">
                            Service Details <span className="required">*</span>
                        </h3>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label className="detail-label">Starting Price</label>
                                <div className="price-input-wrapper">
                                    <span className="currency">₱</span>
                                    <input
                                    type="text"
                                    className="detail-input price-input"
                                    defaultValue={500}
                                    value={startingPrice}
                                    onChange={(e) => setStartingPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">Price Type</label>
                                <select className="detail-select" 
                                    defaultValue="fixed"
                                    value={priceType} 
                                    onChange={(e) => setPriceType(e.target.value)}>
                                    <option value="fixed" selected="">Fixed Price</option>
                                    <option value="hourly">Hourly Rate</option>
                                    <option value="negotiable">Negotiable</option>
                                </select>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">Delivery Time</label>
                                <select className="detail-select" 
                                    value={deliveryTime} 
                                    onChange={(e) => setDeliveryTime(e.target.value)}>
                                    <option value="1-2">1-2 days</option>
                                    <option value="3-5">3-5 days</option>
                                    <option value="1week" selected="">
                                    1 week
                                    </option>
                                    <option value="2weeks">2 weeks</option>
                                    <option value="1month">1 month</option>
                                </select>
                            </div>
                            <div className="detail-item">
                                <label className="detail-label">Experience Level</label>
                                <select className="detail-select" 
                                    value={experienceLevel} 
                                    onChange={(e) => setExperienceLevel(e.target.value)}>
                                    <option value="entry">Entry Level</option>
                                    <option value="intermediate" selected="">
                                    Intermediate
                                    </option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Portfolio/Work Samples */}
                    <div className="form-section">
                        <h3 className="form-section-title">Upload Work Samples</h3>
                        <div className="upload-area" {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p className="upload-text">Drag & drop an image here, or click to select</p>
                            <p className="upload-hint">Supported: JPG & PNG (max 10MB each)</p>
                        </div>
                        <div className="file-list">
                            {workSamples.map((file, index) => (
                                <div className="file-item">
                                    <div className="file-info">
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                    <button className="file-remove" onClick={() => removeFile(file.name)}>×</button>
                                </div>
                            ))}
                        </div>
                        {/* <div className="file-counter">3/5 files uploaded</div> */}
                    </div>

                    {/* Submit Section */}
                    <div className="form-section submit-section">
                        <div>{message}</div>
                        <div className="action-buttons">
                            <button
                            className="btn-post"
                            onClick={handlePostService}
                            >
                            Post Service
                            </button>
                                <button
                                className="btn-cancel"
                                onClick={handleCancel}     
                            >
                            Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        {/* FOOTER */}
        <footer className="footer">
            <div className="footer-content">
            <div className="footer-brand">
                <img
                src={logo2}
                alt="Archer's Freelance Hub"
                className="footer-logo"
                />
                <div>
                <p className="footer-brand-name">Archer's Freelance Hub</p>
                <span className="badge">DLSU Exclusive</span>
                </div>
            </div>
            <div className="footer-links">
                <a href="contactpage.html">About</a>
                <a href="contactpage.html#team-members">Contact</a>
            </div>
            <p className="copyright">
                © 2026 Archer's Freelance Hub. All rights reserved.
            </p>
            </div>
        </footer>
    </>
  );
};

export default PostService;
