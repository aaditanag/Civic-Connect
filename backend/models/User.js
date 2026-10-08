const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const REGIONS = [
  'Bangalore', 'Delhi', 'Mumbai', 'Chennai',
  'Hyderabad', 'Kolkata', 'Pune', 'Jaipur',
  'Ahmedabad', 'Surat', 'Lucknow', 'Nagpur'
];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'department_staff'],
    default: 'citizen'
  },
  // ── Department staff specific fields ──────────────────────
  department: {
    type: String,
    enum: ['Public Works', 'Sanitation', 'Water Department', 'Electricity', null],
    default: null
  },
  region: {
    type: String,
    enum: [...REGIONS, null],
    default: null
  },
  // Official government employee ID (e.g. KA-SAN-2024-0042)
  employeeId: {
    type: String,
    trim: true,
    default: null
  },
  // Official designation/title (e.g. "Senior Sanitation Officer")
  designation: {
    type: String,
    trim: true,
    default: null
  },
  // ── Approval workflow ──────────────────────────────────────
  // Citizens & admin auto-approved; department_staff starts false
  isApproved: {
    type: Boolean,
    default: true
  },
  rejectionReason: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: String,
    default: null
  },
  // ── Common fields ─────────────────────────────────────────
  phone: {
    type: String,
    trim: true
  },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create model safely
let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

module.exports = User;
module.exports.REGIONS = REGIONS;