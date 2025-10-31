import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-indian-green text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-indian-green font-bold text-xl">C</span>
            </div>
            <h1 className="text-2xl font-bold">CivicConnect</h1>
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-indian-lightGreen transition-colors">Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:text-indian-lightGreen transition-colors">Dashboard</Link>
                <Link to="/report" className="hover:text-indian-lightGreen transition-colors">Report Issue</Link>
                <Link to="/profile" className="hover:text-indian-lightGreen transition-colors">My Reports</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="hover:text-indian-lightGreen transition-colors">Admin</Link>
                )}
              </>
            )}
          </nav>

          <div className="flex space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Welcome, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-indian-green px-4 py-2 rounded-lg font-medium hover:bg-indian-lightGreen transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="bg-white text-indian-green px-4 py-2 rounded-lg font-medium hover:bg-indian-lightGreen transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-indian-saffron text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;