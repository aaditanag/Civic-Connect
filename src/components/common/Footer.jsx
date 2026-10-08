import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-civic-navy text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-civic-gold flex items-center justify-center">
                <span className="text-civic-navy font-black text-lg">C</span>
              </div>
              <span className="font-black text-xl tracking-tight">
                <span className="text-civic-gold">CIVIC</span>CONNECT
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Empowering citizens to report and resolve civic issues, building stronger communities together.
            </p>
            <div className="flex gap-3 mt-5">
              {["🐦", "📘", "📸"].map((icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-civic-gold hover:text-civic-navy flex items-center justify-center transition-all duration-200 text-sm">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-civic-gold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/report", label: "Report an Issue" },
                { to: "/dashboard", label: "Dashboard" },
                { to: "/login", label: "Sign In" },
                { to: "/register", label: "Register" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-civic-gold text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="text-civic-gold opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-civic-gold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <span className="text-civic-gold mt-0.5">📍</span>
                <span>Civic Center, New Delhi, India 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-civic-gold">📞</span>
                <span>+91 11 2345 6789</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-civic-gold">✉️</span>
                <span>support@civicconnect.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/40 text-xs">
            © 2026 CivicConnect. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">
            Together for better communities 🤝
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;