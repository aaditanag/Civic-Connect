import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const navLinks = isAuthenticated
    ? [
        user?.role === "department_staff"
          ? { to: "/department", label: "My Portal" }
          : user?.role === "admin"
          ? { to: "/admin", label: "Admin" }
          : { to: "/dashboard", label: "Dashboard" },
        ...(user?.role !== "department_staff"
          ? [
              { to: "/report", label: "Report Issue" },
              { to: "/profile", label: "My Reports" },
            ]
          : []),
      ]
    : [{ to: "/", label: "Home" }];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-civic-navy/95 backdrop-blur-md shadow-lg shadow-civic-navy/30"
          : "bg-civic-navy"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-9 h-9 rounded-lg bg-civic-gold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-civic-navy font-black text-lg leading-none">C</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">
              <span className="text-civic-gold">CIVIC</span>CONNECT
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white/80 hover:text-civic-gold font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 text-sm uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-white/60 text-sm">
                  Hi,{" "}
                  <span className="text-civic-gold font-semibold">
                    {user?.name?.split(" ")[0]}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm py-1.5 px-4"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2 px-5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block text-white/80 hover:text-civic-gold font-medium px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2 px-4">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn-outline w-full text-center">
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full text-center" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary w-full text-center" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;