const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost:27017/civic-connect-unique').then(async () => {
  const db = mongoose.connection.collection('users');
  let admin = await db.findOne({ role: 'admin' });
  const hash = await bcrypt.hash('admin123', 12);
  
  if (!admin) {
    console.log('No admin found. Creating one...');
    await db.insertOne({
      name: 'System Admin',
      email: 'admin@civic.com',
      password: hash,
      role: 'admin',
      isApproved: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Admin account created! Email: admin@civic.com | Password: admin123');
  } else {
    await db.updateOne({ _id: admin._id }, { $set: { password: hash } });
    console.log('Admin found! Password reset successfully.');
    console.log('Email:', admin.email);
    console.log('Password:', 'admin123');
  }
  process.exit(0);
});
