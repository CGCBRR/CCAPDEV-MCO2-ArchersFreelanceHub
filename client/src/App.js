import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './loginPageFront/LoginPage';
import Homepage from './homePageFront/HomePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Update token state if localStorage changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!(token && user));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route 
          path="/homepage" 
          element={isAuthenticated  ? <Homepage /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;