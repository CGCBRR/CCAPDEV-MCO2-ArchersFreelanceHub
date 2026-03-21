import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AdminDashboard.css";
import logo2 from "./images/logo2.png";
import profile from "./images/profile.jpg";
import "../homePageFront/homePageStyles/main.css";

const AdminDashboard = () => {
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📁");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  
  const navigate = useNavigate();

  // Common emoji options for category icons
  const emojiOptions = [
    "🎨", "📚", "🎬", "💻", "📊", "🎵", "📷", "✍️", "🎭", "🏢", 
    "📖", "🔧", "🎮", "📱", "🖥️", "🎤", "🥋", "🍳", "🧹", "🚗",
    "💼", "📈", "💰", "🤝", "⭐", "🔥", "💡", "🏆", "🎯", "❤️"
  ];

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
      try {
        const res = await axios.get("http://localhost:5000/api/get-profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data);
        
        // Check if user is admin (based on email)
        const adminEmails = [
          'carlo_barreo@dlsu.edu.ph',
          'daniel_rebudiao@dlsu.edu.ph',
          'francis_balcruz@dlsu.edu.ph',
          'anna_papa@dlsu.edu.ph'
        ];
        
        if (!adminEmails.includes(res.data.email)) {
          setMessage("Access denied. Admin only.");
          setTimeout(() => navigate("/homepage"), 2000);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUserProfile();

    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setMessage("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePostService = () => {
    navigate("/postservice");
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/admin/categories",
        {
          name: newCategoryName.trim(),
          icon: newCategoryIcon,
          description: newCategoryDescription
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Category added successfully!");
        setShowAddModal(false);
        setNewCategoryName("");
        setNewCategoryIcon("📁");
        setNewCategoryDescription("");
        // Refresh categories list
        const fetchCategories = async () => {
          const res = await axios.get("http://localhost:5000/api/admin/categories", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setCategories(res.data.data);
          }
        };
        fetchCategories();
      }
    } catch (err) {
      console.error("Error adding category:", err);
      alert(err.response?.data?.message || "Failed to add category");
    }
  };

  const handleEditCategory = async () => {
    if (!editCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/categories/${selectedCategory._id}`,
        {
          name: editCategoryName.trim(),
          icon: editCategoryIcon,
          description: editCategoryDescription
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Category updated successfully!");
        setShowEditModal(false);
        setSelectedCategory(null);
        // Refresh categories list
        const fetchCategories = async () => {
          const res = await axios.get("http://localhost:5000/api/admin/categories", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setCategories(res.data.data);
          }
        };
        fetchCategories();
      }
    } catch (err) {
      console.error("Error updating category:", err);
      alert(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (category) => {
    if (category.serviceCount > 0) {
      alert(`Cannot delete "${category.name}". It is used by ${category.serviceCount} service(s).`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `http://localhost:5000/api/admin/categories/${category._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          alert("Category deleted successfully!");
          // Refresh categories list
          const fetchCategories = async () => {
            const res = await axios.get("http://localhost:5000/api/admin/categories", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
              setCategories(res.data.data);
            }
          };
          fetchCategories();
        }
      } catch (err) {
        console.error("Error deleting category:", err);
        alert(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryIcon(category.icon || "📁");
    setEditCategoryDescription(category.description || "");
    setShowEditModal(true);
  };

  // Calculate total services across all categories
  const totalServices = categories.reduce((sum, cat) => sum + (cat.serviceCount || 0), 0);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-spinner">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-head-container">
        <title>Admin Dashboard | Archer's Freelance Hub</title>
      </div>

      <div className="admin-body-container">
        {/* HEADER - Same as HomePage */}
        <header className="header">
          <div className="header-left">
            <img
              src={logo2}
              alt="Archer's Freelance Hub"
              className="logo-img"
            />
            <div className="brand-text">
              <h1 className="logo-text">Archer's Freelance Hub</h1>
              <span className="badge">Admin Panel</span>
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
                src={userProfile?.profileimage || "http://localhost:5000/assets/default-avatar.jpg"}
                alt="Profile"
              />
              <span className="online-indicator" />
            </div>
          </div>
        </header>

        <main className="admin-main-container">
          <div className="admin-dashboard">
            {/* Dashboard Header */}
            <div className="admin-dashboard-header">
              <h1 className="admin-dashboard-title">🛡️ Admin Dashboard</h1>
              <p className="admin-dashboard-subtitle">Manage your platform categories</p>
            </div>

            {/* Quick Stats */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">📁</div>
                <div className="admin-stat-info">
                  <h3>{categories.length}</h3>
                  <p>Total Categories</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">📦</div>
                <div className="admin-stat-info">
                  <h3>{totalServices}</h3>
                  <p>Total Services</p>
                </div>
              </div>
            </div>

            {/* Categories Management */}
            <div className="admin-categories-section">
              <div className="admin-section-header">
                <div>
                  <span className="admin-section-tag">MANAGE</span>
                  <h2 className="admin-section-title">Categories</h2>
                </div>
                <button
                  className="admin-add-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  + Add New Category
                </button>
              </div>

              {/* Categories Table */}
              <div className="admin-table-container">
                <table className="admin-categories-table">
                  <thead>
                    <tr>
                      <th>Icon</th>
                      <th>Category Name</th>
                      <th>Description</th>
                      <th>Services</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="admin-no-data">
                          No categories found. Click "Add New Category" to create one.
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category._id}>
                          <td className="admin-category-icon">{category.icon || "📁"}</td>
                          <td className="admin-category-name">{category.name}</td>
                          <td className="admin-category-desc">
                            {category.description || "—"}
                          </td>
                          <td className="admin-service-count">
                            <span className="admin-count-badge">{category.serviceCount || 0}</span>
                          </td>
                          <td className="admin-actions">
                            <button
                              className="admin-edit-btn"
                              onClick={() => openEditModal(category)}
                            >
                              Edit
                            </button>
                            <button
                              className="admin-delete-btn"
                              onClick={() => handleDeleteCategory(category)}
                              disabled={category.serviceCount > 0}
                              title={
                                category.serviceCount > 0
                                  ? `Cannot delete: used by ${category.serviceCount} service(s)`
                                  : "Delete category"
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add New Category</h3>
              <button className="admin-modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Photography"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="admin-form-group">
                <label>Category Icon (Emoji)</label>
                <div className="admin-emoji-picker">
                  <input
                    type="text"
                    placeholder="e.g., 📷"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    maxLength={2}
                  />
                  <div className="admin-emoji-options">
                    {emojiOptions.map((emoji, idx) => (
                      <button
                        key={idx}
                        className="admin-emoji-option"
                        onClick={() => setNewCategoryIcon(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="Brief description of this category"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-modal-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="admin-modal-save" onClick={handleAddCategory}>
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="admin-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Category</h3>
              <button className="admin-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Photography"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label>Category Icon (Emoji)</label>
                <div className="admin-emoji-picker">
                  <input
                    type="text"
                    placeholder="e.g., 📷"
                    value={editCategoryIcon}
                    onChange={(e) => setEditCategoryIcon(e.target.value)}
                    maxLength={2}
                  />
                  <div className="admin-emoji-options">
                    {emojiOptions.map((emoji, idx) => (
                      <button
                        key={idx}
                        className="admin-emoji-option"
                        onClick={() => setEditCategoryIcon(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="Brief description of this category"
                  value={editCategoryDescription}
                  onChange={(e) => setEditCategoryDescription(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-modal-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="admin-modal-save" onClick={handleEditCategory}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;