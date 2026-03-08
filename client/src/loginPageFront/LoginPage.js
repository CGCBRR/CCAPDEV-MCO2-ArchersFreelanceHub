import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  // Function to validate DLSU email
  const isValidDLSUEmail = (email) => {
    const dlsuEmailPattern = /^[a-zA-Z]+_[a-zA-Z]+@dlsu\.edu\.ph$/;
    return dlsuEmailPattern.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear email error when user types
    if (name === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Validate email format for DLSU
    if (!isValidDLSUEmail(formData.email)) {
      setEmailError('Please use a valid DLSU email (format: first_last@dlsu.edu.ph)');
      return;
    }

    // Validate username for create account
    if (activeTab === 'create' && !formData.username.trim()) {
      setMessage({ type: 'error', text: 'Username is required' });
      return;
    }

    try {
      const endpoint = activeTab === 'login' ? 'login' : 'register';
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        if (activeTab === 'login') {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('Login successful:', data.user);
          // You can redirect here if needed
          // window.location.href = '/homepage';
        } else {
          setFormData({ email: '', password: '', username: '' });
          setActiveTab('login');
        }
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="logo-section">
            <img src="/assets/dlsu-login-logo.png" alt="DLSU Logo" />
            <h1>Archer's Freelance Hub</h1>
            <p className="subtitle">Welcome to the community</p>
          </div>

          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setMessage('');
                setEmailError('');
              }}
            >
              Log In
            </button>
            <button 
              className={`tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('create');
                setMessage('');
                setEmailError('');
              }}
            >
              Create Account
            </button>
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Username field - only shows for Create Account tab */}
            {activeTab === 'create' && (
              <div className="input-group">
                <label>Username</label>
                <input 
                  type="text" 
                  name="username"
                  placeholder="Choose a username" 
                  value={formData.username}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            )}

            <div className="input-group">
              <label>DLSU Email</label>
              <input 
                type="email" 
                name="email"
                placeholder="DLSU email" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
              {emailError && <small className="error-text">{emailError}</small>}
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                />
                <span className="toggle-password" onClick={togglePassword}>
                  {showPassword ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>

            <button type="submit" className="login-btn">
              {activeTab === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="copyright">
            © 2026 Archer's Freelance Hub. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;