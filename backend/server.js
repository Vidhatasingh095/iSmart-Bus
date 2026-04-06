const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan'); // Import morgan
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());      
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// --- Middleware Setup ---

// 1. CORS and JSON Parsing
// These should come first to apply to all incoming requests.
app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

// 2. Logging with Morgan
// Create a write stream (in append mode) for file logging
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });

// Log to the console in 'dev' format
app.use(morgan('dev')); 
// Log to the file in 'combined' format
app.use(morgan('combined', { stream: logStream }));

// 3. Static File Serving
// Serve the frontend files (HTML, CSS, JS)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// --- Database Connection ---
const mongoURI = 'mongodb://127.0.0.1:27017/bustrack';
mongoose.connect(mongoURI)
    .then(() => console.log("✅ SUCCESS: CONNECTED TO LOCAL MONGODB!"))
    .catch((err) => console.log("❌ DB ERROR:", err.message));

// --- API Routes ---
const authRoutes = require('./models/auth');
app.use('/api/auth', authRoutes);
app.get("/api/bus", (req, res) => {
  res.json({
    bus: "Bus 101",
    location: { lat: 28.6, lng: 77.2 }
  });
});
// SSE (Server-Sent Events) setup for real-time updates
const clients = new Set();

app.post('/api/notify', (req, res) => {
    const payload = { ...req.body, ts: Date.now() };
    for (const c of clients) {
        try { c.write(`data: ${JSON.stringify(payload)}\n\n`); } catch (e) {}
    }
    res.json({ ok: true });
});

app.get('/api/driver/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders && res.flushHeaders();
    res.write('retry: 3000\n\n');
    clients.add(res);
    req.on('close', () => {
        clients.delete(res);
        res.end();
    });
});

// --- Catch-all Route for Frontend ---
// This should come after API routes. It ensures that any direct navigation
// to a frontend route (e.g., /dashboard) is handled by serving the index.html,
// allowing the frontend router to take over.
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Server Start ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});