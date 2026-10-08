import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { issueService } from "../services/issueService";

const getStatusCls = (status) => {
  switch (status) {
    case 'resolved':   return 'badge-resolved';
    case 'inProgress': return 'badge-progress';
    case 'pending':    return 'badge-pending';
    case 'closed':     return 'badge-closed';
    default:           return 'badge-pending';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'inProgress': return 'In Progress';
    case 'pending':    return 'Pending';
    default:           return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Profile = () => {
  const { user } = useAuth();
  const [userReports, setUserReports] = useState([]);
  const [statistics, setStatistics] = useState({ total: 0, resolved: 0, inProgress: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    const fetchUserReports = async () => {
      try {
        const response = await issueService.getUserReports();
        setUserReports(response.issues);
        setStatistics(response.statistics);
      } catch (error) {
        console.error('Error fetching user reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserReports();
  }, [user]);

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CC';

  const filteredReports = filter === 'all'
    ? userReports
    : filter === 'open'
    ? userReports.filter(r => r.status !== 'resolved' && r.status !== 'closed')
    : userReports.filter(r => r.status === 'resolved');

  if (loading) {
    return (
      <div className="page-bg font-outfit py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="card shimmer h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg font-outfit">
      {/* Page Header */}
      <div className="bg-civic-navy py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gold-line" />
          <h1 className="text-3xl font-black text-white">My Profile</h1>
          <p className="text-white/50 text-sm mt-1">Manage your account and track your reports</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ──────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">

            {/* User Card */}
            <div className="card border border-gray-100 text-center">
              <div className="w-20 h-20 rounded-2xl bg-civic-navy flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-black text-civic-gold">{initials}</span>
              </div>
              <h2 className="text-xl font-bold text-civic-navy">{user?.name || 'User'}</h2>
              <p className="text-gray-400 text-sm mt-1">{user?.email || ''}</p>
              <div className="mt-2 inline-block">
                <span className="badge-resolved capitalize">{user?.role || 'citizen'}</span>
              </div>
              <p className="text-gray-400 text-xs mt-3">
                Joined {user ? new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
              </p>
              <button className="btn-primary w-full mt-5 py-2.5 rounded-xl text-sm">
                Edit Profile
              </button>
            </div>

            {/* Activity Summary */}
            <div className="card border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-civic-gold mb-4">Activity Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: statistics.total,      label: "Total",       cls: "bg-civic-navy text-white" },
                  { value: statistics.resolved,   label: "Resolved",    cls: "bg-emerald-50 text-emerald-800 border border-emerald-200" },
                  { value: statistics.inProgress, label: "In Progress", cls: "bg-amber-50 text-amber-800 border border-amber-200" },
                  { value: statistics.pending,    label: "Pending",     cls: "bg-blue-50 text-blue-800 border border-blue-200" },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl p-3 flex flex-col items-center gap-1 ${s.cls}`}>
                    <span className="text-2xl font-black">{s.value}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column ─────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="card border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-civic-navy">My Reports</h3>
                <div className="flex gap-2">
                  {["all", "open", "resolved"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                        filter === f
                          ? "bg-civic-navy text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <div
                      key={report._id}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-civic-gold/30 hover:bg-civic-gold/5 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-civic-navy text-sm truncate">{report.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {report.location?.address || 'Location not specified'} · {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <span className={`ml-4 flex-shrink-0 ${getStatusCls(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-civic-gold/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-gray-400 text-sm">No reports found. Start by reporting an issue!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;