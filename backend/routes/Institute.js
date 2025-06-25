const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const Institute = require('../models/Institutes.js');

router.get('/get', userAuth ,async(req, res) => {
    try{
        const adminId= req.user._id;
        const institute = await Institute.findOne({adminId})
        if (!institute) {
            return res.status(404).json({ success: false, message: "No institute found" });
        }

        res.status(200).json({ success: true, message: "Institute fetched", data: institute });

    } catch (error) {
        console.error("Error fetching institute:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})

module.exports=router;