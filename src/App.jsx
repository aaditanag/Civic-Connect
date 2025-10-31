import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import CitizenView from './pages/CitizenView';
import AdminView from './pages/AdminView';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ReportIssue from './pages/ReportIssue';
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-indian-lightGreen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><CitizenView /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminView /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
