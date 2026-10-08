import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { issueService } from "../services/issueService";

const statusConfig = {
  resolved:   { cls: "badge-resolved",  label: "Resolved" },
  inProgress: { cls: "badge-progress",  label: "In Progress" },
  pending:    { cls: "badge-pending",   label: "Pending" },
};

const CitizenView = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({ total: 0, resolved: 0, inProgress: 0, pending: 0 });
  const [communityIssues, setCommunityIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const userResponse = await issueService.getUserReports();
          setUserStats(userResponse.statistics);
        }
        const issuesResponse = await issueService.getIssues({ limit: 9, sort: '-createdAt' });
        setCommunityIssues(issuesResponse.issues || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleVote = async (issueId) => {
    if (!user) { alert('Please log in to vote on issues.'); return; }
    try {
      await issueService.voteIssue(issueId);
      setUserVotes(prev => new Set([...prev, issueId]));
      const issuesResponse = await issueService.getIssues({ limit: 9, sort: '-createdAt' });
      setCommunityIssues(issuesResponse.issues || []);
    } catch (error) {
      if (error.response?.status === 400) alert('You have already voted on this issue.');
      else alert('Failed to vote on issue. Please try again.');
    }
  };

  const StatCard = ({ value, label, color }) => (
    <div className={`rounded-2xl p-6 flex flex-col items-center gap-1 ${color}`}>
      <span className="text-3xl font-black">{value}</span>
      <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
    </div>
  );

  return (
    <div className="page-bg font-outfit">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="bg-civic-navy py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-civic-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <span className="text-civic-gold text-xs font-bold uppercase tracking-widest block mb-3">Citizen Dashboard</span>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            <span className="text-civic-gold">Spot.</span> Report. <span className="text-civic-gold">Resolve.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            Help keep your community clean and safe by reporting civic issues.
          </p>
          <Link
            to="/report"
            className="btn-primary text-base py-3 px-10 rounded-xl shadow-lg shadow-civic-gold/20 inline-block"
          >
            + Report an Issue
          </Link>
        </div>
      </section>

      {/* ── MY STATS ──────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="gold-line mx-auto" />
            <h2 className="section-title">My Reports</h2>
            <p className="section-subtitle">Track the status of issues you've reported</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard value={userStats.total}      label="Total Reports" color="bg-civic-navy text-white" />
            <StatCard value={userStats.resolved}   label="Resolved"      color="bg-emerald-50 text-emerald-800 border border-emerald-200" />
            <StatCard value={userStats.inProgress} label="In Progress"   color="bg-amber-50 text-amber-800 border border-amber-200" />
            <StatCard value={userStats.pending}    label="Pending"       color="bg-blue-50 text-blue-800 border border-blue-200" />
          </div>

          <div className="text-center">
            <Link to="/profile" className="btn-primary py-2.5 px-8 rounded-xl inline-block">
              View All My Reports
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto" />
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple steps to make your community better</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "📸", step: 1, title: "Spot an Issue", desc: "Find problems like potholes, garbage, or broken infrastructure in your area." },
              { icon: "📝", step: 2, title: "Report It",     desc: "Take a photo, add details, and submit your report through our easy-to-use app." },
              { icon: "✅", step: 3, title: "Track Progress",desc: "Monitor your report's status and get notified when the issue gets resolved." },
            ].map((item) => (
              <div key={item.step} className="card card-hover border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-civic-gold/10 border-2 border-civic-gold/30 flex items-center justify-center mb-4">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-civic-gold mb-2 block">Step {item.step}</span>
                <h3 className="text-lg font-bold text-civic-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ISSUES ──────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto" />
            <h2 className="section-title">Recent Community Issues</h2>
            <p className="section-subtitle">See what others are reporting in your area</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="card shimmer h-48" />
              ))
            ) : communityIssues.length > 0 ? (
              communityIssues.map((issue) => {
                const sc = statusConfig[issue.status] || { cls: "badge-pending", label: issue.status };
                return (
                  <div key={issue._id} className="card card-hover border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className={sc.cls}>{sc.label}</span>
                      <span className="text-xs text-gray-400">{formatDate(issue.createdAt)}</span>
                    </div>
                    <h4 className="font-bold text-civic-navy">{issue.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1">{issue.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>📍 {issue.location?.address || 'Location not specified'}</span>
                      <span>👍 {issue.votes || 0}</span>
                    </div>
                    <button
                      onClick={() => handleVote(issue._id)}
                      disabled={userVotes.has(issue._id)}
                      className={`w-full font-semibold py-2 px-4 rounded-xl transition-all text-sm ${
                        userVotes.has(issue._id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'btn-secondary'
                      }`}
                    >
                      {userVotes.has(issue._id) ? '✓ Voted' : '👍 Upvote'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-civic-gold/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-gray-400 font-medium">No recent issues found. Be the first to report!</p>
                <Link to="/report" className="btn-primary mt-4 inline-block py-2.5 px-8 rounded-xl">Report an Issue</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 bg-civic-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-white/60 mb-8">
            Join thousands of citizens actively improving their communities one report at a time.
          </p>
          <Link to="/report" className="btn-primary text-base py-3 px-10 rounded-xl inline-block shadow-lg shadow-civic-gold/20">
            Report an Issue Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CitizenView;