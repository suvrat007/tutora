const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin.js');
const userAuth  =require("../middleware/userAuth.js");

router.get('/get',userAuth,async (req,res)=>{
    try{
        const userId = req.user._id
        const admin = await Admin.findById(userId).select("-password").populate('institute_info')

        if(!admin){
            return res.status(404).json('No user found');
        }

        res.status(200).json({ message: "fetched", data: admin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "error" });
    }
} )

module.exports = router;