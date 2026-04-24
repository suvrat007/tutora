const express = require('express');
const router = express.Router();
const Teacher = require('../models/All_Teachers_Schema.js');
const userAuth = require('../middleware/userAuth.js');
const mongoose = require('mongoose');

router.post('/add', userAuth, async (req, res) => {
    try {
        const { name, qualification, emailId, phoneNumber, teaching_batches, subjects } = req.body;
        if (!name || !qualification || !emailId || !phoneNumber) {
            return res.status(400).json({ message: 'name, qualification, email and phone are required' });
        }
        const teacher = new Teacher({
            adminId: req.user._id,
            name,
            qualification,
            contact_info: { emailId, phoneNumber },
            subjects: subjects || [],
            teaching_batches: teaching_batches || [],
        });
        await teacher.save();
        return res.status(201).json(teacher);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/all', userAuth, async (req, res) => {
    try {
        const teachers = await Teacher.find({ adminId: req.user._id })
            .populate('teaching_batches.batch_id', 'name forStandard');
        return res.status(200).json(teachers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.put('/update/:id', userAuth, async (req, res) => {
    try {
        const { name, qualification, emailId, phoneNumber, teaching_batches, subjects } = req.body;
        const update = {};
        if (name) update.name = name;
        if (qualification) update.qualification = qualification;
        if (emailId || phoneNumber) {
            update['contact_info.emailId'] = emailId;
            update['contact_info.phoneNumber'] = phoneNumber;
        }
        if (subjects !== undefined) update.subjects = subjects;
        if (teaching_batches !== undefined) update.teaching_batches = teaching_batches;

        const teacher = await Teacher.findOneAndUpdate(
            { _id: req.params.id, adminId: req.user._id },
            { $set: update },
            { new: true }
        ).populate('teaching_batches.batch_id', 'name forStandard');

        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        return res.status(200).json(teacher);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete('/delete/:id', userAuth, async (req, res) => {
    try {
        const result = await Teacher.deleteOne({ _id: req.params.id, adminId: req.user._id });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Teacher not found' });
        return res.status(200).json({ message: 'Teacher deleted' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
