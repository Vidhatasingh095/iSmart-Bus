const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, enum: ['student', 'user', 'admin', 'driver'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    otp: { type: String }, // For signup verification
    createdAt: { type: Date, default: Date.now },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
