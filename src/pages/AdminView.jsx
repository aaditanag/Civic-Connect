import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

// ── Helpers ────────────────────────────────────────────────────────────────
const getStatusCls = (s) => {
  if (s === 'resolved')   return 'badge-resolved';
  if (s === 'inProgress') return 'badge-progress';
  if (s === 'pending')    return 'badge-pending';
  return 'badge-closed';
};
const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
const daysSince = (d) => Math.floor((Date.now() - new Date(d)) / 86400000);

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, gradient, sub }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-md flex flex-col gap-2`}>
    <div className="flex items-center justify-between">
      <span className="text-2xl">{icon}</span>
      <span className="text-3xl font-black">{value ?? '—'}</span>
    </div>
    <p className="text-xs font-bold uppercase tracking-widest text-white/70">{label}</p>
    {sub && <p className="text-xs text-white/50">{sub}</p>}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const AdminView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats,    setStats]    = useState(null);
  const [pending,  setPending]  = useState([]);
  const [users,    setUsers]    = useState([]);
  const [issues,   setIssues]   = useState([]);
  const [stale,    setStale]    = useState([]);
  const [issueFilter, setIssueFilter] = useState('all');
  const [rejectModal, setRejectModal] = useState(null); // user object
  const [rejectReason, setRejectReason] = useState('');
  const [reminderModal, setReminderModal] = useState(null); // issue object
  const [reminderMsg, setReminderMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userFilter, setUserFilter] = useState('all');

  // ── Fetch data ─────────────────────────────────────────────────────────
  const loadStats   = useCallback(() => adminService.getStats().then(setStats).catch(console.error), []);
  const loadPending = useCallback(() => adminService.getPendingApprovals().then(d => setPending(d.users)).catch(console.error), []);
  const loadUsers   = useCallback((role) => adminService.getUsers(role === 'all' ? '' : role).then(d => setUsers(d.users)).catch(console.error), []);
  const loadIssues  = useCallback((status) => adminService.getIssues({ status: status === 'all' ? '' : status, limit: 50 }).then(d => setIssues(d.issues)).catch(console.error), []);
  const loadStale   = useCallback(() => adminService.getStaleIssues().then(d => setStale(d.issues)).catch(console.error), []);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'approvals') loadPending();
    if (activeTab === 'users')     loadUsers(userFilter);
    if (activeTab === 'issues')    loadIssues(issueFilter);
    if (activeTab === 'stale')     loadStale();
  }, [activeTab, issueFilter, userFilter, loadPending, loadUsers, loadIssues, loadStale]);

  // ── Actions ────────────────────────────────────────────────────────────
  const handleApprove = async (id, name) => {
    setSubmitting(true);
    try {
      await adminService.approveUser(id);
      toast.success(`✅ ${name} approved! They can now log in.`);
      loadPending(); loadStats();
    } catch (e) { toast.error(e.message); }
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason'); return; }
    setSubmitting(true);
    try {
      await adminService.rejectUser(rejectModal._id, rejectReason);
      toast.success(`Rejected ${rejectModal.name}`);
      setRejectModal(null); setRejectReason('');
      loadPending(); loadStats();
    } catch (e) { toast.error(e.message); }
    setSubmitting(false);
  };

  const handleReminder = async () => {
    setSubmitting(true);
    try {
      await adminService.sendReminder(reminderModal._id, reminderMsg);
      toast.success('Reminder sent and logged on the issue ✅');
      setReminderModal(null); setReminderMsg('');
      if (activeTab === 'stale') loadStale();
      if (activeTab === 'issues') loadIssues(issueFilter);
      loadStats();
    } catch (e) { toast.error(e.message); }
    setSubmitting(false);
  };

  // ── Tabs config ────────────────────────────────────────────────────────
  const tabs = [
    { id: 'overview',  label: '📊 Overview' },
    { id: 'approvals', label: `⏳ Approvals${stats?.pendingApprovals ? ` (${stats.pendingApprovals})` : ''}` },
    { id: 'users',     label: '👥 All Users' },
    { id: 'issues',    label: '📋 All Issues' },
    { id: 'stale',     label: `🔔 Stale Issues${stats?.staleIssues ? ` (${stats.staleIssues})` : ''}` },
  ];

  return (
    <div className="page-bg font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="gold-line" />
            <h1 className="text-3xl font-black text-civic-navy">Admin Control Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Full visibility across citizens, authorities, and all civic issues</p>
          </div>
          <button onClick={() => { loadStats(); toast('Refreshed ✅', { icon: '🔄' }); }}
            className="btn-secondary py-2 px-5 rounded-xl text-sm">
            🔄 Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex flex-wrap gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.id ? 'bg-civic-navy text-white shadow-md' : 'text-gray-500 hover:text-civic-navy hover:bg-gray-50'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ──────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Issues"    value={stats?.totalIssues}    icon="📊" gradient="from-civic-navy to-civic-navyCard" />
              <StatCard label="Pending Issues"  value={stats?.pendingIssues}  icon="⏳" gradient="from-amber-600 to-amber-500" />
              <StatCard label="Resolved"        value={stats?.resolvedIssues} icon="✅" gradient="from-emerald-700 to-emerald-600" />
              <StatCard label="Stale Issues"    value={stats?.staleIssues}    icon="🔔" gradient="from-red-700 to-red-600" sub=">3 days unresolved" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Citizens"          value={stats?.totalCitizens}   icon="🏘️" gradient="from-blue-700 to-blue-600" />
              <StatCard label="Active Authorities" value={stats?.totalAuthorities} icon="🏛️" gradient="from-purple-700 to-purple-600" />
              <StatCard label="Pending Approvals" value={stats?.pendingApprovals} icon="📋" gradient="from-orange-600 to-orange-500" />
              <StatCard label="Reminders Sent"    value={stats?.remindersSent}   icon="📨" gradient="from-teal-700 to-teal-600" />
            </div>

            {/* Quick action: Jump to stale if any */}
            {stats?.staleIssues > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-red-800">⚠️ {stats.staleIssues} issue{stats.staleIssues > 1 ? 's' : ''} over 3 days without resolution</p>
                  <p className="text-red-600/70 text-sm">Review and send reminders to the responsible authorities</p>
                </div>
                <button onClick={() => setActiveTab('stale')} className="btn-primary bg-red-700 hover:bg-red-800 py-2 px-5 rounded-xl text-sm whitespace-nowrap">
                  View Stale Issues →
                </button>
              </div>
            )}
            {stats?.pendingApprovals > 0 && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                <div>
                  <p className="font-bold text-amber-800">📋 {stats.pendingApprovals} authority application{stats.pendingApprovals > 1 ? 's' : ''} awaiting your review</p>
                  <p className="text-amber-600/70 text-sm">Approve or reject pending authority registrations</p>
                </div>
                <button onClick={() => setActiveTab('approvals')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors whitespace-nowrap">
                  Review Approvals →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── PENDING APPROVALS ──────────────────────────────────────── */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-black text-civic-navy mb-5">
              Pending Authority Approvals <span className="text-civic-gold">({pending.length})</span>
            </h2>
            {pending.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-4xl block mb-3">✅</span>
                <p className="text-gray-400 font-medium">No pending approvals — all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map(u => (
                  <div key={u._id} className="border-2 border-gray-100 hover:border-civic-gold/30 rounded-2xl p-5 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-black text-civic-navy">{u.name}</h3>
                          <span className="badge-pending text-xs">Pending</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{u.email}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { icon: '🏙️', label: 'Region',      val: u.region },
                            { icon: '🏛️', label: 'Department',   val: u.department },
                            { icon: '🪪',  label: 'Employee ID',  val: u.employeeId },
                            { icon: '👔',  label: 'Designation',  val: u.designation },
                          ].map(item => (
                            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400 mb-0.5">{item.icon} {item.label}</p>
                              <p className="font-bold text-civic-navy text-sm">{item.val || '—'}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Applied {timeAgo(u.createdAt)}</p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(u._id, u.name)}
                          disabled={submitting}
                          className="btn-primary py-2 px-5 rounded-xl text-sm disabled:opacity-50">
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => { setRejectModal(u); setRejectReason(''); }}
                          className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-semibold py-2 px-5 rounded-xl text-sm transition-colors">
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ALL USERS ──────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-black text-civic-navy">All Users</h2>
              <div className="flex gap-2">
                {['all', 'citizen', 'department_staff'].map(f => (
                  <button key={f} onClick={() => { setUserFilter(f); loadUsers(f); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                      userFilter === f ? 'bg-civic-navy text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {f === 'all' ? 'All' : f === 'citizen' ? 'Citizens' : 'Authorities'}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    {['Name', 'Role', 'Region / Dept', 'Employee ID', 'Status', 'Joined'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-civic-navy text-sm">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'admin'            ? 'bg-purple-100 text-purple-700' :
                          u.role === 'department_staff' ? 'bg-blue-100 text-blue-700' :
                                                          'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role === 'department_staff' ? 'Authority' : u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-civic-navy font-medium">{u.region || '—'}</p>
                        <p className="text-xs text-gray-400">{u.department || ''}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-mono text-gray-600">{u.employeeId || '—'}</p>
                        <p className="text-xs text-gray-400">{u.designation || ''}</p>
                      </td>
                      <td className="py-4 px-4">
                        {u.role === 'department_staff' ? (
                          <span className={u.isApproved ? 'badge-resolved' : 'badge-pending'}>
                            {u.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        ) : <span className="badge-resolved">Active</span>}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">{timeAgo(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ALL ISSUES ─────────────────────────────────────────────── */}
        {activeTab === 'issues' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-black text-civic-navy">All Issues</h2>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'inProgress', 'resolved', 'closed'].map(f => (
                  <button key={f} onClick={() => setIssueFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      issueFilter === f ? 'bg-civic-navy text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {f === 'all' ? 'All' : f === 'inProgress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {issues.map(issue => (
                <div key={issue._id} className={`border rounded-2xl p-4 transition-all hover:shadow-sm ${
                  issue.reminderSentAt ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={getStatusCls(issue.status)}>{issue.status}</span>
                        {issue.reminderSentAt && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            🔔 Reminded {timeAgo(issue.reminderSentAt)}
                          </span>
                        )}
                        <span className="bg-civic-navy/5 text-civic-navy px-2 py-0.5 rounded-full text-xs">{issue.department || 'No Dept'}</span>
                        {issue.region && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">📍 {issue.region}</span>}
                      </div>
                      <p className="font-bold text-civic-navy">{issue.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        By {issue.reportedBy?.name || 'Unknown'} · {timeAgo(issue.createdAt)} ·
                        {daysSince(issue.createdAt)} day{daysSince(issue.createdAt) !== 1 ? 's' : ''} old
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!['resolved','closed'].includes(issue.status) && (
                        <button onClick={() => { setReminderModal(issue); setReminderMsg(''); }}
                          className="bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 text-xs font-semibold py-1.5 px-3 rounded-xl transition-colors">
                          🔔 Send Reminder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {issues.length === 0 && (
                <div className="text-center py-12"><p className="text-gray-400">No issues found</p></div>
              )}
            </div>
          </div>
        )}

        {/* ── STALE ISSUES ───────────────────────────────────────────── */}
        {activeTab === 'stale' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-civic-navy">Stale Issues</h2>
                <p className="text-gray-400 text-sm mt-1">Issues open for more than 3 days without resolution</p>
              </div>
              {stale.length > 0 && (
                <span className="bg-red-100 text-red-700 font-black text-lg px-4 py-2 rounded-xl">
                  {stale.length} issue{stale.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {stale.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-4xl block mb-3">🎉</span>
                <p className="text-gray-400 font-medium">No stale issues — great response time!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stale.map(issue => {
                  const days = daysSince(issue.createdAt);
                  return (
                    <div key={issue._id} className={`rounded-2xl p-5 border-2 ${
                      days > 7 ? 'border-red-300 bg-red-50/40' :
                      days > 5 ? 'border-orange-300 bg-orange-50/40' :
                                 'border-amber-200 bg-amber-50/30'
                    }`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={getStatusCls(issue.status)}>{issue.status}</span>
                            <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${
                              days > 7 ? 'bg-red-200 text-red-800' :
                              days > 5 ? 'bg-orange-200 text-orange-800' : 'bg-amber-200 text-amber-800'
                            }`}>
                              ⏰ {days} days old
                            </span>
                            {issue.reminderSentAt && (
                              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                                Reminded {timeAgo(issue.reminderSentAt)}
                              </span>
                            )}
                          </div>
                          <p className="font-black text-civic-navy">{issue.title}</p>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{issue.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                            {issue.region && <span>📍 {issue.region}</span>}
                            {issue.department && <span>🏛️ {issue.department}</span>}
                            <span>👤 {issue.reportedBy?.name || 'Unknown'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => { setReminderModal(issue); setReminderMsg(''); }}
                          className="btn-primary py-2.5 px-5 rounded-xl text-sm shrink-0 shadow-lg shadow-civic-gold/20">
                          🔔 Send Reminder
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── REJECT MODAL ──────────────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-black text-civic-navy mb-1">Reject Application</h2>
            <p className="text-gray-400 text-sm mb-5">👤 {rejectModal.name} · {rejectModal.employeeId}</p>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Reason for Rejection *
            </label>
            <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Employee ID could not be verified..."
              className="input-civic resize-none mb-5" />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 border-2 border-gray-200 text-gray-500 py-2.5 rounded-2xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleReject} disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-2xl text-sm font-black transition-colors disabled:opacity-50">
                {submitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REMINDER MODAL ────────────────────────────────────────────── */}
      {reminderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-black text-civic-navy mb-1">Send Reminder</h2>
            <p className="text-gray-400 text-sm mb-1 truncate">📋 {reminderModal.title}</p>
            <p className="text-xs text-gray-400 mb-5">
              Open for {daysSince(reminderModal.createdAt)} days ·
              {reminderModal.region && ` ${reminderModal.region} ·`}
              {reminderModal.department && ` ${reminderModal.department}`}
            </p>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Reminder Message <span className="font-normal normal-case">(or leave blank for default)</span>
            </label>
            <textarea rows={3} value={reminderMsg} onChange={e => setReminderMsg(e.target.value)}
              placeholder="⚠️ This issue has been unresolved for over 3 days. Please prioritize and update the status."
              className="input-civic resize-none mb-5" />
            <div className="flex gap-3">
              <button onClick={() => setReminderModal(null)}
                className="flex-1 border-2 border-gray-200 text-gray-500 py-2.5 rounded-2xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleReminder} disabled={submitting}
                className="flex-1 btn-primary py-2.5 rounded-2xl text-sm disabled:opacity-50">
                {submitting ? 'Sending...' : '🔔 Send Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;