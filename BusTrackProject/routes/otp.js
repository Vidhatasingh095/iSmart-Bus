const express = require('express');
const router = express.Router();
// OTP store karne ke liye hum temporary database ya Redis use kar sakte hain
let otpStore = {}; 

router.post('/send-otp', async (req, res) => {
    const { mobile } = req.body;
    
    // 1. Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // 2. Save OTP for 5 minutes (for verification later)
    otpStore[mobile] = otp;

    // 3. Send SMS (Twilio Example)
    // client.messages.create({ body: `Your BusTrack OTP is ${otp}`, from: '+123', to: mobile });

    console.log(`OTP for ${mobile} is ${otp}`); // For Testing in Console
    res.status(200).json({ msg: "OTP sent successfully" });
});