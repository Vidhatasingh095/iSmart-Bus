const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json()); 
app.use(cors()); 

// 1. MongoDB Connection
mongoose.connect('mongodb+srv://svidhata28_db_user:<db_password>@cluster0.ob2o4ni.mongodb.net/?appName=Cluster0')
<password>FeLX22EYScsljXPq
    .then(() => console.log("✅ Database Connected Successfully!"))
    .catch((err) => console.log("❌ DB Connection Error:", err));

// 2. Routes (Ab hum saara logic authRoutes mein bhej rahe hain)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 3. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});