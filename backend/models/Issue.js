const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Potholes & Roads',
      'Street Lighting',
      'Garbage & Sanitation',
      'Water Supply',
      'Drainage Issues',
      'Parks & Public Spaces',
      'Traffic Signals',
      'Illegal Construction',
      'Other'
    ]
  },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Region where issue was reported (city)
  region: {
    type: String,
    default: null
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'inProgress', 'resolved', 'closed'],
    default: 'pending'
  },
  images: [{
    url: String,
    public_id: String
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: String,
    default: null
  },
  department: {
    type: String,
    enum: ['Public Works', 'Sanitation', 'Water Department', 'Electricity', 'Other', null],
    default: null
  },
  votes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: String,
    text: String,
    isSystemComment: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // ── Reminder / Stale tracking ──────────────────────────────
  reminderSentAt: {
    type: Date,
    default: null
  },
  reminderSentBy: {
    type: String,   // admin name
    default: null
  }
}, {
  timestamps: true
});

// Virtual: is the issue stale (>3 days old and not resolved/closed)?
issueSchema.virtual('isStale').get(function () {
  if (['resolved', 'closed'].includes(this.status)) return false;
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  return this.createdAt < threeDaysAgo;
});

issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

let Issue;
try {
  Issue = mongoose.model('Issue');
} catch {
  Issue = mongoose.model('Issue', issueSchema);
}

module.exports = Issue;