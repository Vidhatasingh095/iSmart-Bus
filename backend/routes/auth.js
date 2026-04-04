const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Check karein aapka model path sahi ho

// OTP Store (Temporary memory) - Ye server restart hone par reset ho jayega
let otpStore = {}; 

// 1. Send OTP Route
router.post('/send-otp', (req, res) => {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ msg: "Mobile number required" });

    // 6 Digit OTP generate karein
    const otp = Math.floor(100000 + Math.random() * 900000); 
    otpStore[mobile] = otp;

    console.log(`\n📩 [OTP] Mobile: ${mobile} | OTP: ${otp}\n`); // Terminal mein check karein
    res.status(200).json({ msg: "OTP Sent Successfully!", otp }); // Testing ke liye OTP bhej rahe hain
});

// 2. Signup Route (OTP Validation ke saath)
router.post('/signup', async (req, res) => {
    try {
        const { name, email, mobile, password, role, otp } = req.body;

        // OTP Check
        if (!otpStore[mobile] || otpStore[mobile] != otp) {
            return res.status(400).json({ msg: "Invalid or Expired OTP" });
        }

        // Email check
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Password hash karein
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Naya user banayein
        user = new User({ 
            name, 
            email, 
            mobile, 
            password: hashedPassword, 
            role 
        });

        await user.save();

        delete otpStore[mobile]; // OTP delete kar dein
        res.status(201).json({ msg: "User registered successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error during signup" });
    }
});

// 3. Login Route (Optional: Dashboard ke liye zaroori hai)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

        const token = jwt.sign({ id: user._id, role: user.role }, "secret_key", { expiresIn: '1h' });
        res.json({ token, role: user.role, name: user.name });

    } catch (err) {
        res.status(500).json({ msg: "Login Error" });
    }
});
// 4. FORGOT PASSWORD - RESET LOGIC
router.post('/reset-password', async (req, res) => {
    try {
        const { mobile, otp, newPassword } = req.body;

        // 1. Check if OTP is correct
        if (!otpStore[mobile] || otpStore[mobile] != otp) {
            return res.status(400).json({ msg: "Invalid or Expired OTP" });
        }

        // 2. Find User
        let user = await User.findOne({ mobile });
        if (!user) return res.status(404).json({ msg: "User not found with this mobile number" });

        // 3. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update Password
        user.password = hashedPassword;
        await user.save();

        delete otpStore[mobile]; // OTP saaf kar do
        res.status(200).json({ msg: "Password Reset Successfully! Now you can Login." });

    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});
module.exports = router;