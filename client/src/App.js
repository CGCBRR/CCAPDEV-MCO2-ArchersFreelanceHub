import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './loginPageFront/LoginPage';
import Homepage from './homePageFront/HomePage';
import PostService from './postServiceFront/PostService';
import ProfilePage from './profilePageFront/profilePage';
import EditPage from './editPageFront/editPage';
import AdminDashboard from './adminDashboardFront/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Update token state if localStorage changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route 
          path="/homepage" 
          element={isAuthenticated ? <Homepage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/postservice" 
          element={isAuthenticated ? <PostService /> : <Navigate to="/" />} 
        />
        <Route 
          path="/my-projects" 
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/edit-profile" 
          element={isAuthenticated ? <EditPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;