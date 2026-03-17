import React, { useEffect, useState, useCallback } from "react";
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
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sortBy: "newest"
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false
  });
  
  const navigate = useNavigate();

  // Debounce search to avoid too many API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Search function
  const performSearch = async (page = 1) => {
    if (!searchQuery.trim() && searchCategory === 'all' && !searchFilters.minPrice && !searchFilters.maxPrice) {
      // If no search criteria, show all services
      setSearchResults([]);
      setSearchPerformed(false);
      return;
    }

    setIsSearching(true);
    setSearchPerformed(true);

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        q: searchQuery,
        category: searchCategory,
        page: page,
        limit: 12,
        sortBy: searchFilters.sortBy
      });

      if (searchFilters.minPrice) params.append('minPrice', searchFilters.minPrice);
      if (searchFilters.maxPrice) params.append('maxPrice', searchFilters.maxPrice);

      const response = await axios.get(
        `http://localhost:5000/api/search-services?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (page === 1) {
          setSearchResults(response.data.data);
        } else {
          setSearchResults(prev => [...prev, ...response.data.data]);
        }
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("Search error:", err);
      setMessage("Error performing search");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(() => performSearch(1), 500),
    [searchQuery, searchCategory, searchFilters]
  );

  // Load more results
  const loadMore = () => {
    if (pagination.hasMore && !isSearching) {
      performSearch(pagination.currentPage + 1);
    }
  };

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/service-categories", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Trigger search when inputs change
  useEffect(() => {
    if (searchQuery || searchCategory !== 'all' || searchFilters.minPrice || searchFilters.maxPrice) {
      debouncedSearch();
    } else {
      setSearchResults([]);
      setSearchPerformed(false);
    }
  }, [searchQuery, searchCategory, searchFilters.minPrice, searchFilters.maxPrice, searchFilters.sortBy]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchCategory("all");
    setSearchFilters({
      minPrice: "",
      maxPrice: "",
      sortBy: "newest"
    });
    setSearchResults([]);
    setSearchPerformed(false);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasMore: false
    });
  };

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

    // Fetch lists of services
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

  const openPopup = (service) => {
    // You can implement a modal to show service details
    console.log("Open service details:", service);
  };

  // Determine which services to display
  const displayedServices = searchPerformed ? searchResults : services;

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
            <Link to="/" className="nav-link active">
              Browse
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

                {/* Enhanced Search Section */}
                <div className="search-section">
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <select 
                      className="category-select"
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      <option value="Visual Arts">🎨 Visual Arts</option>
                      <option value="Academic Help">📚 Academic Help</option>
                      <option value="Video Editing">🎬 Video Editing</option>
                      <option value="Programming">💻 Programming</option>
                      <option value="Marketing">📊 Marketing</option>
                      <option value="Music & Audio">🎵 Music & Audio</option>
                    </select>

                    <button 
                      className="filter-toggle-btn"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      Filters {showFilters ? '▲' : '▼'}
                    </button>

                    {(searchQuery || searchCategory !== 'all' || searchFilters.minPrice || searchFilters.maxPrice) && (
                      <button 
                        className="clear-search-btn"
                        onClick={clearSearch}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="advanced-filters">
                      <div className="filter-group">
                        <label>Price Range (₱)</label>
                        <div className="price-range">
                          <input
                            type="number"
                            placeholder="Min"
                            value={searchFilters.minPrice}
                            onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
                            min="0"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={searchFilters.maxPrice}
                            onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div className="filter-group">
                        <label>Sort By</label>
                        <select
                          value={searchFilters.sortBy}
                          onChange={(e) => setSearchFilters({...searchFilters, sortBy: e.target.value})}
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="price_low">Price: Low to High</option>
                          <option value="price_high">Price: High to Low</option>
                        </select>
                      </div>
                    </div>
                  )}
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
            </div>
          </section>

          {/* Search Results Section */}
          {searchPerformed && (
            <section className="featured-section">
              <div className="section-header">
                <div>   
                  <span className="section-tag">SEARCH RESULTS</span>
                  <h2 className="section-title">
                    Found {pagination.totalCount} service{pagination.totalCount !== 1 ? 's' : ''}
                  </h2>
                </div>
              </div>

              {isSearching && searchResults.length === 0 ? (
                <div className="loading-container">
                  <div className="loading-spinner">Searching...</div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="no-results">
                  <p>No services found matching your criteria.</p>
                  <button className="clear-search-btn" onClick={clearSearch}>
                    Clear Search
                  </button>
                </div>
              ) : (
                <>
                  <div className="freelancers-grid">
                    {searchResults.map((service, index) => (
                      <div key={index} className="freelancer-card" onClick={() => openPopup(service)}>
                        <div className="card-header">
                          <div className="user-info">
                            <img 
                              src={service.image?.[0] || profile} 
                              alt={service.freelancer.fullName} 
                              className="user-avatar" 
                            />
                            <div>
                              <h3 className="user-name">{service.title}</h3>
                              <p className="user-meta">by {service.freelancer.fullName}</p>
                            </div>
                          </div>
                        </div>

                        <div className="stats-row">
                          <div className="stat">
                            <span className="stat-value">₱{service.startingprice.toFixed(2)}</span>
                            <span className="stat-label">{service.pricetype}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-value">{service.category}</span>
                            <span className="stat-label">Category</span>
                          </div>
                          <div className="stat">
                            <span className="stat-value">{service.deliverytime}</span>
                            <span className="stat-label">Delivery</span>
                          </div>
                        </div>

                        <p className="freelancer-bio">
                          {service.description.length > 100 
                            ? `${service.description.substring(0, 100)}...` 
                            : service.description}
                        </p>

                        <div className="service-tags">
                          <span className="service-tag">{service.experiencelevel}</span>
                        </div>

                        <div className="portfolio-grid">
                          {service.image && service.image.length > 0 && (
                            <img src={service.image[0]} alt="Work Sample" />
                          )}
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

                  {/* Load More Button */}
                  {pagination.hasMore && (
                    <div className="load-more-container">
                      <button 
                        className="load-more-btn"
                        onClick={loadMore}
                        disabled={isSearching}
                      >
                        {isSearching ? 'Loading...' : 'Load More Services'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

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
                <button className="category-card" onClick={() => {
                  setSearchCategory('Visual Arts');
                  setShowFilters(false); // Optional: close filters when clicking category
                }}>
                    <div className="category-icon">🎨</div>
                    <h3>Visual Arts</h3>
                    <p>Design, illustration, photography</p>
                </button>
                <button className="category-card" onClick={() => {
                  setSearchCategory('Academic Help');
                  setShowFilters(false);
                }}>
                    <div className="category-icon">📚</div>
                    <h3>Academic Help</h3>
                    <p>Tutoring, research, editing</p>
                </button>
                <button className="category-card" onClick={() => {
                  setSearchCategory('Video Editing');
                  setShowFilters(false);
                }}>
                    <div className="category-icon">🎬</div>
                    <h3>Video Editing</h3>
                    <p>Production, post-processing</p>
                </button>
                <button className="category-card" onClick={() => {
                  setSearchCategory('Programming');
                  setShowFilters(false);
                }}>
                    <div className="category-icon">💻</div>
                    <h3>Programming</h3>
                    <p>Web, mobile, software</p>
                </button>
                <button className="category-card" onClick={() => {
                  setSearchCategory('Marketing');
                  setShowFilters(false);
                }}>
                    <div className="category-icon">📊</div>
                    <h3>Marketing</h3>
                    <p>Social media, SEO, content</p>
                </button>
                <button className="category-card" onClick={() => {
                  setSearchCategory('Music & Audio');
                  setShowFilters(false);
                }}>
                    <div className="category-icon">🎵</div>
                    <h3>Music & Audio</h3>
                    <p>Production, Mixing, Voice-over</p>
                </button>
              </div>
            </div>
          </section>

          {/* Featured Freelancers - Only show if not searching */}
          {!searchPerformed && (
            <section className="featured-section">
              <div className="section-header">
                <div>   
                  <span className="section-tag">FEATURED</span>
                  <h2 className="section-title">Top freelancers this week</h2>
                </div>
                <a href="#" className="view-all">View all →</a>
              </div>

              <div className="freelancers-grid">
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
          )}

          {/* Featured Services - Only show if not searching */}
          {!searchPerformed && (
            <section className="featured-section">
              <div className="section-header">
                <div>   
                  <span className="section-tag">FEATURED</span>
                  <h2 className="section-title">Top services this week</h2>
                </div>
                <a href="#" className="view-all">View all →</a>
              </div>

              <div className="freelancers-grid">
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
                                <span className="stat-label">Delivery</span>
                            </div>
                        </div>

                        <p className="freelancer-bio">
                            {service.description || "No description available."}
                        </p>

                        <div className="portfolio-grid">
                            <img src={service.image} alt={"No Work Samples"} />
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
          )}
        </main>
      </div>
    </>
  );
};

export default Homepage;