const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Public Works', 'Sanitation', 'Water Department', 'Electricity', 'Other']
  },
  description: {
    type: String,
    maxlength: 500
  },
  head: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  categories: [{
    type: String,
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
  }],
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  activeIssues: {
    type: Number,
    default: 0
  },
  resolvedIssues: {
    type: Number,
    default: 0
  },
  averageResolutionTime: {
    type: Number, // in days
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create model only if mongoose is connected
let Department;
try {
  Department = mongoose.model('Department');
} catch {
  Department = mongoose.model('Department', departmentSchema);
}

module.exports = Department;
