import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',     color: 'bg-yellow-100 text-yellow-800 border-yellow-300',  dot: 'bg-yellow-400', icon: '⏳' },
  inProgress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-300',        dot: 'bg-blue-400',   icon: '🚧' },
  resolved:   { label: 'Resolved',    color: 'bg-green-100 text-green-800 border-green-300',     dot: 'bg-green-500',  icon: '✅' },
  closed:     { label: 'Closed',      color: 'bg-gray-100 text-gray-700 border-gray-300',        dot: 'bg-gray-400',   icon: '🔒' },
};

const URGENCY_CONFIG = {
  high:   { color: 'bg-red-100 text-red-700',    label: 'High' },
  medium: { color: 'bg-orange-100 text-orange-700', label: 'Medium' },
  low:    { color: 'bg-green-100 text-green-700', label: 'Low' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0)  return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export default function DepartmentView() {
  const { user } = useAuth();
  const [issues, setIssues]         = useState([]);
  const [stats, setStats]           = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusModal, setStatusModal]     = useState(false);
  const [commentModal, setCommentModal]   = useState(false);
  const [newStatus, setNewStatus]   = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const res = await api.get(`/departments/issues${params}`);
      setIssues(res.data.issues);
      setStats(res.data.stats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const openStatusModal = (issue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setStatusNote('');
    setStatusModal(true);
  };

  const openCommentModal = (issue) => {
    setSelectedIssue(issue);
    setCommentText('');
    setCommentModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setSubmitting(true);
    try {
      await api.put(`/departments/issues/${selectedIssue._id}/status`, { status: newStatus, note: statusNote });
      toast.success('Status updated!');
      setStatusModal(false);
      fetchIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) { toast.error('Comment cannot be empty'); return; }
    setSubmitting(true);
    try {
      await api.post(`/departments/issues/${selectedIssue._id}/comment`, { text: commentText });
      toast.success('Comment added!');
      setCommentModal(false);
      fetchIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const StatCard = ({ label, value, icon, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 flex items-center gap-4 text-white shadow-md`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="page-bg font-outfit">
      {/* Header Banner */}
      <div className="bg-civic-navy text-white px-6 py-10 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="gold-line" />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                🏛️ Department Portal
              </h1>
              <p className="text-white/50 mt-1 text-sm">
                Welcome, <span className="font-bold text-civic-gold">{user?.name}</span> — Managing:
                <span className="ml-2 bg-civic-gold text-civic-navy font-bold px-2 py-0.5 rounded-full text-xs mr-1">
                  📍 {user?.region || 'No Region'}
                </span>
                <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded-full text-xs">
                  {user?.department || 'Unassigned'}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">Last refreshed</p>
              <p className="text-civic-gold font-semibold text-sm">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total"       value={stats.total}      icon="📋" gradient="from-civic-navy to-civic-navyCard" />
          <StatCard label="Pending"     value={stats.pending}    icon="⏳" gradient="from-amber-600 to-amber-500" />
          <StatCard label="In Progress" value={stats.inProgress} icon="🚧" gradient="from-blue-700 to-blue-600" />
          <StatCard label="Resolved"    value={stats.resolved}   icon="✅" gradient="from-emerald-700 to-emerald-600" />
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mr-2">Filter:</span>
          {['all', 'pending', 'inProgress', 'resolved', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-civic-navy text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
          <button
            onClick={fetchIssues}
            className="ml-auto px-4 py-1.5 rounded-xl text-sm font-semibold bg-civic-gold/10 text-civic-gold hover:bg-civic-gold/20 transition-all"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Issue List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-civic-gold border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <span className="text-5xl block mb-4">📭</span>
            <h3 className="text-lg font-bold text-civic-navy">No issues found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {filterStatus !== 'all' ? `No ${STATUS_CONFIG[filterStatus]?.label} issues for your department.` : 'Your department has no issues reported yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map(issue => {
              const sc = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;
              const uc = URGENCY_CONFIG[issue.urgency] || URGENCY_CONFIG.medium;
              return (
                <div key={issue._id} className={`rounded-2xl shadow-sm border p-5 transition-all ${
                  issue.reminderSentAt ? 'border-orange-300 bg-orange-50/50 hover:shadow-md' : 'bg-white border-gray-100 hover:border-civic-gold/30 hover:shadow-md'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {sc.label}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${uc.color}`}>
                          {uc.label} Urgency
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-civic-navy/10 text-civic-navy">
                          {issue.category}
                        </span>
                        {issue.reminderSentAt && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 animate-pulse border border-orange-200">
                            🔔 Admin Reminder
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-civic-navy mb-1 truncate">{issue.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">{issue.description}</p>

                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        {issue.location?.address && (
                          <span>📍 {issue.location.address}</span>
                        )}
                        <span>🕒 {timeAgo(issue.createdAt)}</span>
                        {issue.reportedBy?.name && (
                          <span>👤 {issue.reportedBy.name}</span>
                        )}
                        {issue.votes > 0 && (
                          <span>👍 {issue.votes} votes</span>
                        )}
                        {issue.assignedTo && (
                          <span>🔧 Assigned to: {issue.assignedTo}</span>
                        )}
                      </div>

                      {issue.comments?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          💬 {issue.comments.length} note{issue.comments.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openStatusModal(issue)}
                        className="btn-primary text-xs py-2 px-3 rounded-xl"
                      >
                        ✏️ Update Status
                      </button>
                      <button
                        onClick={() => openCommentModal(issue)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold py-2 px-3 rounded-xl transition-colors"
                      >
                        💬 Add Note
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-black text-civic-navy mb-1">Update Issue Status</h2>
            <p className="text-sm text-gray-400 mb-5 truncate">📋 {selectedIssue.title}</p>

            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">New Status</label>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setNewStatus(key)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${
                    newStatus === key
                      ? 'border-civic-gold bg-civic-gold/10 text-civic-navy shadow-md'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-civic-gold/40'
                  }`}
                >
                  <span>{cfg.icon}</span> {cfg.label}
                </button>
              ))}
            </div>

            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Note <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
            <textarea
              rows={3}
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
              placeholder="Add a note about this status change..."
              className="input-civic resize-none mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStatusModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-500 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={submitting}
                className="flex-1 btn-primary py-2.5 rounded-2xl text-sm disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-black text-civic-navy mb-1">Add Staff Note</h2>
            <p className="text-sm text-gray-400 mb-5 truncate">📋 {selectedIssue.title}</p>

            {selectedIssue.comments?.length > 0 && (
              <div className="mb-4 max-h-36 overflow-y-auto space-y-2">
                {selectedIssue.comments.map((c, i) => (
                  <div key={i} className={`rounded-xl px-3 py-2 text-xs ${
                    c.isSystemComment ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50'
                  }`}>
                    <p className={`font-bold ${c.isSystemComment ? 'text-orange-700' : 'text-civic-navy'}`}>
                      {c.user}
                    </p>
                    <p className={`mt-0.5 ${c.isSystemComment ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                      {c.text}
                    </p>
                    <p className="text-gray-400 mt-1">{timeAgo(c.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}

            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Your Note</label>
            <textarea
              rows={4}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a note or update for this issue..."
              className="input-civic resize-none mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setCommentModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-500 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={submitting}
                className="flex-1 btn-secondary py-2.5 rounded-2xl text-sm disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
