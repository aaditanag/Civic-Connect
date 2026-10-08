import api from './api';

const adminService = {
  // ── Stats ───────────────────────────────────────────────
  getStats: () =>
    api.get('/admin/stats').then(r => r.data),

  // ── Pending approvals ───────────────────────────────────
  getPendingApprovals: () =>
    api.get('/admin/pending-approvals').then(r => r.data),

  approveUser: (id) =>
    api.put(`/admin/users/${id}/approve`).then(r => r.data),

  rejectUser: (id, reason) =>
    api.put(`/admin/users/${id}/reject`, { reason }).then(r => r.data),

  // ── Users ───────────────────────────────────────────────
  getUsers: (role) =>
    api.get('/admin/users', { params: role ? { role } : {} }).then(r => r.data),

  // ── Issues ──────────────────────────────────────────────
  getIssues: (params = {}) =>
    api.get('/admin/issues', { params }).then(r => r.data),

  getStaleIssues: () =>
    api.get('/admin/stale-issues').then(r => r.data),

  sendReminder: (id, message) =>
    api.post(`/admin/issues/${id}/reminder`, { message }).then(r => r.data),

  deleteIssue: (id) =>
    api.delete(`/admin/issues/${id}`).then(r => r.data),
};

export default adminService;
