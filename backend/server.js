const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// In-memory storage
let users = [];

// Root test route
app.get('/', (req, res) => {
    res.send("API Running...");
});

// POST /register (MAIN FIX)
app.post('/register', (req, res) => {
    console.log("Register API hit:", req.body);
    const { name, city, deliveryType } = req.body;
    
    if (!name || !city || !deliveryType) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = 'USR-' + Date.now();
    const trustScore = 50;
    
    const newUser = {
        userId,
        name,
        city,
        deliveryType,
        trustScore
    };
    
    users.push(newUser);
    
    res.json({
        message: "User registered successfully",
        userId: userId,
        trustScore: trustScore
    });
});

// POST /calculate-premium
app.post('/calculate-premium', (req, res) => {
    const { city } = req.body;
    let riskLevel = 'Low';
    let premium = 20;

    const normalizedCity = city ? city.toLowerCase() : '';
    if (normalizedCity === 'mumbai') {
        riskLevel = 'High';
        premium = 40;
    } else if (normalizedCity === 'hyderabad') {
        riskLevel = 'Medium';
        premium = 30;
    } else if (normalizedCity === 'bangalore' || normalizedCity === 'bengaluru') {
        riskLevel = 'Low';
        premium = 20;
    }

    res.json({ premium, riskLevel, message: "Premium calculated successfully" });
});

// POST /claim
app.post('/claim', (req, res) => {
    const { userId, weather, demandDrop, fraudInputs } = req.body;
    
    const user = users.find(u => u.userId === userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Step 1: Check event
    if (!(weather === 'rain' && demandDrop > 40)) {
        return res.json({
            status: "REJECTED",
            riskScore: 0,
            payout: 0,
            message: "Conditions not met for income loss"
        });
    }

    // Step 2: Fraud Detection
    const { speed = 0, sameDevice = false, frequentClaims = false, ipMismatch = false } = fraudInputs || {};
    let riskScore = 0;

    if (speed > 100) riskScore += 30;
    if (sameDevice === true) riskScore += 25;
    if (frequentClaims === true) riskScore += 20;
    if (ipMismatch === true) riskScore += 15;

    // Adjust using user's trust score
    if (user.trustScore > 70) riskScore -= 10;
    if (user.trustScore < 30) riskScore += 10;

    // Step 3: Decision
    let status = "";
    let payout = 0;

    if (riskScore < 30) {
        status = "APPROVED";
        payout = 200;
    } else if (riskScore >= 30 && riskScore <= 70) {
        status = "VERIFICATION REQUIRED";
        payout = 0;
    } else {
        status = "REJECTED";
        payout = 0;
    }

    res.json({
        riskScore,
        status,
        payout,
        message: "Claim processed successfully"
    });
});

app.listen(PORT, () => {
    console.log(`TrustPay AI Backend server is running on http://localhost:${PORT}`);
});
