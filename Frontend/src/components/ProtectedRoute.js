import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

   
    const isAuthenticated = !!localStorage.getItem('logout');

    if (!isAuthenticated) {
        
        console.log('Using token for API request:', isAuthenticated);
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    
    return children;
};

export default ProtectedRoute;