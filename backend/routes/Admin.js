const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin.js');
const Institute = require('../models/Institutes.js');
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

router.patch('/update', userAuth, async (req, res) => {
    try {
        const { name, emailId, adminPicURL, institute_info } = req.body;
        const adminId = req.user._id;

        if (!name || !emailId || !institute_info?.name || !institute_info?.contact_info?.emailId || !institute_info?.contact_info?.phone_number) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const adminUpdate = {
            name,
            emailId,
            adminPicURL: adminPicURL || admin.adminPicURL
        };

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            adminUpdate,
            { new: true }
        );

        const instituteUpdate = {
            name: institute_info.name,
            logo_URL: institute_info.logo_URL || '',
            contact_info: {
                emailId: institute_info.contact_info.emailId,
                phone_number: institute_info.contact_info.phone_number,
            },
        };

        const updatedInstitute = await Institute.findByIdAndUpdate(
            admin.institute_info,
            instituteUpdate,
            { new: true }
        );

        if (!updatedInstitute) {
            return res.status(404).json({ message: 'Institute not found' });
        }

        res.status(200).json({
            message: 'Admin and institute details updated successfully',
            admin: updatedAdmin,
            institute: updatedInstitute
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: error.message || 'An unexpected error occurred during update' });
    }
});

module.exports = router;