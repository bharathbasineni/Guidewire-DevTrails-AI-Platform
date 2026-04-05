const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /register
router.post('/register', async (req, res) => {
    try {
        console.log("Register API hit", req.body);
        const { name, city, deliveryType } = req.body;
        
        const deviceId = 'DEV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const user = new User({
            name,
            city,
            deliveryType,
            deviceId
        });
        
        await user.save();
        
        console.log(`[POST /register] User ${name} registered with ID ${user._id}`);
        res.json({ userId: user._id, message: "User registered successfully" });
    } catch (error) {
        console.error("[POST /register] Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /calculate-premium
router.post('/calculate-premium', (req, res) => {
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

    console.log(`[POST /calculate-premium] City: ${city} | Risk: ${riskLevel} | Premium: ₹${premium}`);
    res.json({ premium, riskLevel });
});

// POST /claim
router.post('/claim', async (req, res) => {
    try {
        const { userId, weather, demandDrop, fraudInputs } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log(`[POST /claim] Processing claim for userId: ${userId}`);

        // Step 1: Check event
        if (!(weather === 'rain' && demandDrop > 40)) {
            console.log(`[POST /claim] No claim triggered`);
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

        console.log(`[POST /claim] Decision: ${status} | Payout: ₹${payout} | Risk Score: ${riskScore}`);

        res.json({
            riskScore,
            status,
            payout
        });
    } catch (error) {
        console.error("[POST /claim] Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
