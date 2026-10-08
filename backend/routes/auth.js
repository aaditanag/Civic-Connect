const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// ── Register ───────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role,
      department, region, phone,
      employeeId, designation
    } = req.body;

    // Check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate authority-specific fields
    if (role === 'department_staff') {
      if (!region)      return res.status(400).json({ message: 'Region is required for authorities' });
      if (!department)  return res.status(400).json({ message: 'Department is required for authorities' });
      if (!employeeId)  return res.status(400).json({ message: 'Employee ID is required for authorities' });
      if (!designation) return res.status(400).json({ message: 'Designation is required for authorities' });

      // Check duplicate employeeId
      const dupEmployee = await User.findOne({ employeeId, role: 'department_staff' });
      if (dupEmployee) {
        return res.status(400).json({ message: 'An authority with this Employee ID already exists' });
      }
    }

    // department_staff must wait for approval; citizens/admin auto-approved
    const isApproved = role !== 'department_staff';

    const user = new User({
      name, email, password, phone,
      role: role || 'citizen',
      department: role === 'department_staff' ? department : null,
      region:     role === 'department_staff' ? region     : null,
      employeeId: role === 'department_staff' ? employeeId : null,
      designation:role === 'department_staff' ? designation: null,
      isApproved
    });

    await user.save();

    // Authorities get a pending response — no token yet
    if (role === 'department_staff') {
      return res.status(201).json({
        pendingApproval: true,
        message: 'Registration successful! Your account is pending admin approval. You will be able to log in once approved.'
      });
    }

    // Citizen / admin — issue token immediately
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        region: user.region
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ message: error.message });
  }
});

// ── Login ──────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if account is deactivated
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated. Contact admin.' });
    }

    // Approval gate for authorities
    if (user.role === 'department_staff' && !user.isApproved) {
      return res.status(403).json({
        code: 'PENDING_APPROVAL',
        message: 'Your account is pending admin approval. Please check back later.',
        rejectionReason: user.rejectionReason || null
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        region: user.region,
        employeeId: user.employeeId,
        designation: user.designation,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Get current user ───────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        region: user.region,
        employeeId: user.employeeId,
        designation: user.designation,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;