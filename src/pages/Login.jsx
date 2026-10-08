import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData]           = useState({ email: '', password: '' });
  const [loading, setLoading]             = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [rejected, setRejected]           = useState(null); // rejection reason string
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Welcome back! 👋');
      const role = result.user?.role;
      if (role === 'department_staff') navigate('/department');
      else if (role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } else if (result.pendingApproval) {
      if (result.rejectionReason) {
        setRejected(result.rejectionReason);
      } else {
        setPendingApproval(true);
      }
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  // ── Pending Approval Banner ────────────────────────────────────────────
  const pendingBanner = pendingApproval && (
    <div className="mb-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
      <p className="text-amber-300 font-bold text-sm flex items-start gap-2">
        <span>⏳</span>
        <span>
          Your authority account is <strong>pending admin approval</strong>.
          You'll be able to log in once an admin reviews your application.
        </span>
      </p>
    </div>
  );

  // ── Rejected Banner ────────────────────────────────────────────────────
  const rejectedBanner = rejected && (
    <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
      <p className="text-red-400 font-bold text-sm mb-1">❌ Application Rejected</p>
      <p className="text-red-300/80 text-xs">{rejected}</p>
      <Link to="/register" className="text-civic-gold text-xs font-semibold mt-2 inline-block hover:underline">
        Re-apply with updated information →
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-civic-navy flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-civic-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-civic-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-civic-navyCard rounded-3xl shadow-2xl shadow-black/40 p-8 border border-white/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-civic-gold mb-4 shadow-lg shadow-civic-gold/30">
              <span className="text-civic-navy font-black text-2xl">C</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              <span className="text-civic-gold">CIVIC</span>CONNECT
            </h1>
            <h2 className="text-lg font-bold text-white mt-4 mb-1">Sign in to your account</h2>
            <p className="text-white/50 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-civic-gold hover:text-civic-goldHover font-semibold transition-colors">
                Register here
              </Link>
            </p>
          </div>

          {pendingBanner}
          {rejectedBanner}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-1.5">
                Email Address
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                className="input-navy" placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white/70 text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password" name="password" type="password" autoComplete="current-password" required
                className="input-navy" placeholder="••••••••"
                value={formData.password} onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-civic-gold/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
