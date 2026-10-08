import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const REGIONS = [
  'Bangalore', 'Delhi', 'Mumbai', 'Chennai',
  'Hyderabad', 'Kolkata', 'Pune', 'Jaipur',
  'Ahmedabad', 'Surat', 'Lucknow', 'Nagpur'
];

const DEPARTMENTS = ['Public Works', 'Sanitation', 'Water Department', 'Electricity'];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    password: '', confirmPassword: '',
    role: 'citizen',
    // authority-specific
    region: '', department: '', employeeId: '', designation: ''
  });
  const [loading, setLoading]           = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const isAuthority = formData.role === 'department_staff';

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      if (result.pendingApproval) {
        setPendingApproval(true); // show success screen
      } else {
        toast.success('Account created! Welcome aboard 🎉');
        navigate('/dashboard');
      }
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  // ── Pending Approval Screen ────────────────────────────────────────────
  if (pendingApproval) {
    return (
      <div className="min-h-screen bg-civic-navy flex items-center justify-center py-12 px-4">
        <div className="relative w-full max-w-md text-center">
          <div className="bg-civic-navyCard rounded-3xl shadow-2xl shadow-black/40 p-10 border border-civic-gold/20">
            <div className="w-20 h-20 rounded-full bg-civic-gold/10 border-2 border-civic-gold/30 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⏳</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Application Submitted!</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Your authority account is <span className="text-civic-gold font-bold">pending admin approval</span>.
              Once reviewed, you'll be able to log in and access your regional dashboard.
            </p>
            <div className="bg-civic-navy rounded-2xl p-4 text-left mb-6 space-y-2">
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-3">Submitted Details</p>
              <p className="text-sm text-white/70"><span className="text-white/40">Employee ID:</span> {formData.employeeId}</p>
              <p className="text-sm text-white/70"><span className="text-white/40">Region:</span> {formData.region}</p>
              <p className="text-sm text-white/70"><span className="text-white/40">Department:</span> {formData.department}</p>
              <p className="text-sm text-white/70"><span className="text-white/40">Designation:</span> {formData.designation}</p>
            </div>
            <Link to="/login" className="btn-primary w-full py-3 rounded-xl inline-block text-center">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Register Form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-civic-navy flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-civic-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-civic-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        <div className="bg-civic-navyCard rounded-3xl shadow-2xl shadow-black/40 p-8 border border-white/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-civic-gold mb-4 shadow-lg shadow-civic-gold/30">
              <span className="text-civic-navy font-black text-2xl">C</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              <span className="text-civic-gold">CIVIC</span>CONNECT
            </h1>
            <h2 className="text-lg font-bold text-white mt-4 mb-1">Create your account</h2>
            <p className="text-white/50 text-sm">
              Already registered?{' '}
              <Link to="/login" className="text-civic-gold hover:text-civic-goldHover font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Account Type</label>
              <select name="role" className="input-navy appearance-none cursor-pointer"
                value={formData.role} onChange={handleChange}>
                <option value="citizen" className="bg-civic-navyCard">🏘️ Citizen</option>
                <option value="department_staff" className="bg-civic-navyCard">🏛️ Government Authority</option>
              </select>
            </div>

            {/* Common fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5">Full Name *</label>
                <input name="name" type="text" required className="input-navy" placeholder="Rahul Kumar"
                  value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5">Phone</label>
                <input name="phone" type="tel" className="input-navy" placeholder="+91 98765 43210"
                  value={formData.phone} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Email Address *</label>
              <input name="email" type="email" required className="input-navy" placeholder="you@example.com"
                value={formData.email} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5">Password *</label>
                <input name="password" type="password" required className="input-navy" placeholder="Min 6 characters"
                  value={formData.password} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5">Confirm Password *</label>
                <input name="confirmPassword" type="password" required className="input-navy" placeholder="••••••••"
                  value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            {/* Authority-specific fields */}
            {isAuthority && (
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-civic-gold text-xs font-bold uppercase tracking-widest">Authority Details</span>
                  <span className="text-white/20 text-xs">(Required for government staff)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Region *</label>
                    <select name="region" required={isAuthority} className="input-navy appearance-none cursor-pointer"
                      value={formData.region} onChange={handleChange}>
                      <option value="">Select city/region</option>
                      {REGIONS.map(r => (
                        <option key={r} value={r} className="bg-civic-navyCard">{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Department *</label>
                    <select name="department" required={isAuthority} className="input-navy appearance-none cursor-pointer"
                      value={formData.department} onChange={handleChange}>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d} className="bg-civic-navyCard">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Employee ID *</label>
                    <input name="employeeId" type="text" required={isAuthority} className="input-navy"
                      placeholder="e.g. KA-SAN-2024-0042"
                      value={formData.employeeId} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Designation *</label>
                    <input name="designation" type="text" required={isAuthority} className="input-navy"
                      placeholder="e.g. Sanitation Officer"
                      value={formData.designation} onChange={handleChange} />
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
                  ⚠️ Authority accounts require admin verification before login is enabled. You'll be notified once approved.
                </div>
              </div>
            )}

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
                  {isAuthority ? 'Submitting application...' : 'Creating account...'}
                </span>
              ) : isAuthority ? '📋 Submit for Approval' : 'Create Account'}
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
