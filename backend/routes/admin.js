const express = require('express');
const User = require('../models/User');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');
const router = express.Router();

// ── Admin-only guard ───────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ── GET /api/admin/stats ───────────────────────────────────────────────────
// Live overview numbers for the admin dashboard
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const [
      totalIssues, pendingIssues, inProgressIssues, resolvedIssues,
      totalCitizens, totalAuthorities, pendingApprovals,
      staleIssues, remindersSent
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'pending' }),
      Issue.countDocuments({ status: 'inProgress' }),
      Issue.countDocuments({ status: 'resolved' }),
      User.countDocuments({ role: 'citizen' }),
      User.countDocuments({ role: 'department_staff', isApproved: true }),
      User.countDocuments({ role: 'department_staff', isApproved: false, rejectionReason: null }),
      Issue.countDocuments({
        status: { $nin: ['resolved', 'closed'] },
        createdAt: { $lt: threeDaysAgo }
      }),
      Issue.countDocuments({ reminderSentAt: { $ne: null } })
    ]);

    res.json({
      totalIssues, pendingIssues, inProgressIssues, resolvedIssues,
      totalCitizens, totalAuthorities, pendingApprovals,
      staleIssues, remindersSent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/admin/pending-approvals ──────────────────────────────────────
router.get('/pending-approvals', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({
      role: 'department_staff',
      isApproved: false,
      rejectionReason: null   // not yet rejected
    }).select('-password').sort({ createdAt: -1 });

    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/admin/users/:id/approve ──────────────────────────────────────
router.put('/users/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'department_staff') {
      return res.status(400).json({ message: 'Only department staff accounts need approval' });
    }

    user.isApproved    = true;
    user.approvedAt    = new Date();
    user.approvedBy    = req.user.name;
    user.rejectionReason = null;
    await user.save();

    res.json({ message: `${user.name} has been approved and can now log in.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/admin/users/:id/reject ───────────────────────────────────────
router.put('/users/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isApproved      = false;
    user.rejectionReason = reason || 'Application rejected by admin';
    user.isActive        = false;
    await user.save();

    res.json({ message: `${user.name}'s application has been rejected.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────────────────
// All users with optional role filter
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach issue count per user
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const issueCount = await Issue.countDocuments({ reportedBy: u._id });
      return { ...u.toObject(), issueCount };
    }));

    res.json({ users: usersWithStats, count: usersWithStats.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/admin/issues ─────────────────────────────────────────────────
// All issues with full population
router.get('/issues', auth, adminOnly, async (req, res) => {
  try {
    const { status, region, department, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (region) filter.region = region;
    if (department) filter.department = department;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email region')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Issue.countDocuments(filter);

    res.json({ issues, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/admin/stale-issues ───────────────────────────────────────────
// Issues >3 days old and not resolved/closed
router.get('/stale-issues', auth, adminOnly, async (req, res) => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const issues = await Issue.find({
      status: { $nin: ['resolved', 'closed'] },
      createdAt: { $lt: threeDaysAgo }
    })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: 1 }); // oldest first

    res.json({ issues, count: issues.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/admin/issues/:id/reminder ───────────────────────────────────
// Admin sends a reminder on a stale issue
router.post('/issues/:id/reminder', auth, adminOnly, async (req, res) => {
  try {
    const { message } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const reminderText = message?.trim()
      || `⚠️ REMINDER: This issue has been open for over 3 days without resolution. Please prioritize and update the status.`;

    issue.reminderSentAt = new Date();
    issue.reminderSentBy = req.user.name;
    issue.comments.push({
      user: `🔔 Admin (${req.user.name})`,
      text: reminderText,
      isSystemComment: true,
      createdAt: new Date()
    });

    await issue.save();
    res.json({ message: 'Reminder sent and logged on the issue.', issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/admin/issues/:id ─────────────────────────────────────────
router.delete('/issues/:id', auth, adminOnly, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
