const express = require('express');
const Issue = require('../models/Issue');
const memoryStorage = require('../utils/memoryStorage');
const auth = require('../middleware/auth');
const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return Issue.db.readyState === 1;
};

// Get all issues
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const { status, category, page = 1, limit = 10 } = req.query;
      let filter = {};
      
      if (status) filter.status = status;
      if (category) filter.category = category;

      const issues = await Issue.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Issue.countDocuments(filter);

      res.json({
        issues,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } else {
      // Use memory storage
      const issues = await memoryStorage.getIssues();
      res.json({
        issues,
        totalPages: 1,
        currentPage: 1,
        total: issues.length
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single issue
router.get('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const issue = await Issue.findById(req.params.id);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      res.json(issue);
    } else {
      const issue = await memoryStorage.getIssue(req.params.id);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      res.json(issue);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new issue
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating issue with data:', req.body);

    const issueData = {
      ...req.body,
      reportedBy: req.user.id
    };

    if (isMongoConnected()) {
      const issue = new Issue(issueData);
      const savedIssue = await issue.save();
      res.status(201).json(savedIssue);
    } else {
      const issue = await memoryStorage.createIssue(issueData);
      res.status(201).json(issue);
    }
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update issue
router.put('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const issue = await Issue.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      res.json(issue);
    } else {
      const issue = await memoryStorage.updateIssue(req.params.id, req.body);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      res.json(issue);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete issue
router.delete('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const issue = await Issue.findByIdAndDelete(req.params.id);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      res.json({ message: 'Issue deleted successfully' });
    } else {
      const success = await memoryStorage.deleteIssue(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Issue not found' });
      }
      res.json({ message: 'Issue deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's issues
router.get('/user/my-reports', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const issues = await Issue.find({ reportedBy: req.user.id })
        .sort({ createdAt: -1 });

      // Calculate statistics
      const total = issues.length;
      const resolved = issues.filter(issue => issue.status === 'resolved').length;
      const inProgress = issues.filter(issue => issue.status === 'inProgress').length;
      const pending = issues.filter(issue => issue.status === 'pending').length;

      res.json({
        issues,
        statistics: {
          total,
          resolved,
          inProgress,
          pending
        }
      });
    } else {
      // Memory storage implementation
      const allIssues = await memoryStorage.getIssues();
      const issues = allIssues.filter(issue => issue.reportedBy === req.user.id);

      const total = issues.length;
      const resolved = issues.filter(issue => issue.status === 'resolved').length;
      const inProgress = issues.filter(issue => issue.status === 'inProgress').length;
      const pending = issues.filter(issue => issue.status === 'pending').length;

      res.json({
        issues,
        statistics: {
          total,
          resolved,
          inProgress,
          pending
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on issue
router.post('/:id/vote', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const issue = await Issue.findById(req.params.id);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }

      // Check if user has already voted
      const hasVoted = issue.votedBy.includes(req.user.id);

      if (hasVoted) {
        return res.status(400).json({ message: 'You have already voted on this issue' });
      }

      // Add vote
      issue.votes += 1;
      issue.votedBy.push(req.user.id);
      await issue.save();

      res.json({
        message: 'Vote added successfully',
        votes: issue.votes
      });
    } else {
      // Memory storage implementation
      const issue = await memoryStorage.getIssue(req.params.id);
      if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
      }

      // Check if user has already voted
      if (!issue.votedBy) {
        issue.votedBy = [];
      }

      if (issue.votedBy.includes(req.user.id)) {
        return res.status(400).json({ message: 'You have already voted on this issue' });
      }

      // Add vote
      issue.votes = (issue.votes || 0) + 1;
      issue.votedBy.push(req.user.id);

      await memoryStorage.updateIssue(req.params.id, issue);

      res.json({
        message: 'Vote added successfully',
        votes: issue.votes
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
