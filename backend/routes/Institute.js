const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const Institute = require('../models/Institutes.js');

router.post('/create-institute', userAuth, async (req, res) => {
    const adminId = req.user._id;
    const { name, logo_URL, contact_info } = req.body;

    try {
        const newInstitute = new Institute({
            adminId,
            name,
            logo_URL,
            contact_info
        });

        const savedInstitute = await newInstitute.save()

        res.status(201).json({ success: true, institute: savedInstitute });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create institute", error: error.message });
    }
});

module.exports=router;