const express = require('express');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');
const router = express.Router();

// Staff or admin only
const staffOnly = (req, res, next) => {
  if (req.user.role !== 'department_staff' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Department staff only.' });
  }
  next();
};

// ── GET /api/departments/issues ───────────────────────────────────────────
// Issues for this authority's region + department
router.get('/issues', auth, staffOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const { department, region, role } = req.user;

    // Admin can see everything; department_staff filtered by region + dept
    let filter = {};
    if (role === 'department_staff') {
      if (!department || !region) {
        return res.status(400).json({ message: 'No department/region assigned to this account.' });
      }
      filter = { department, region };
    }

    if (status && status !== 'all') filter.status = status;

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email');

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const stats = {
      total:      issues.length,
      pending:    issues.filter(i => i.status === 'pending').length,
      inProgress: issues.filter(i => i.status === 'inProgress').length,
      resolved:   issues.filter(i => i.status === 'resolved').length,
      closed:     issues.filter(i => i.status === 'closed').length,
      stale:      issues.filter(i =>
                    !['resolved','closed'].includes(i.status) &&
                    new Date(i.createdAt) < threeDaysAgo
                  ).length,
      reminders:  issues.filter(i => i.reminderSentAt).length,
    };

    res.json({ issues, stats, department, region });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/departments/issues/:id/status ────────────────────────────────
router.put('/issues/:id/status', auth, staffOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'inProgress', 'resolved', 'closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found.' });

    // Department staff can only update issues in their region+dept
    if (req.user.role === 'department_staff') {
      if (issue.department !== req.user.department || issue.region !== req.user.region) {
        return res.status(403).json({ message: 'You can only update issues in your region and department.' });
      }
    }

    issue.status     = status;
    issue.assignedTo = req.user.name;

    if (note && note.trim()) {
      issue.comments.push({
        user: req.user.name,
        text: `[Status → ${status}] ${note.trim()}`,
        isSystemComment: false,
        createdAt: new Date()
      });
    }

    await issue.save();
    res.json({ message: 'Issue status updated.', issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/departments/issues/:id/comment ──────────────────────────────
router.post('/issues/:id/comment', auth, staffOnly, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required.' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found.' });

    if (req.user.role === 'department_staff') {
      if (issue.department !== req.user.department || issue.region !== req.user.region) {
        return res.status(403).json({ message: 'You can only comment on issues in your region and department.' });
      }
    }

    issue.comments.push({ user: req.user.name, text: text.trim(), createdAt: new Date() });
    await issue.save();

    res.json({ message: 'Comment added.', comments: issue.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
