const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PendingStudent = require('../models/PendingStudent');
const Student = require('../models/Student');
const Institute = require('../models/Institutes');
const Batch = require('../models/Batch');
const userAuth = require('../middleware/userAuth');

// ── Protected admin routes (defined BEFORE /:adminId to avoid param collision) ──

router.get('/pending', userAuth, async (req, res) => {
    try {
        const pending = await PendingStudent.find({ adminId: req.adminId }).sort({ submittedAt: -1 });
        res.json({ data: pending });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch pending registrations' });
    }
});

router.post('/pending/:id/approve', userAuth, async (req, res) => {
    try {
        const pending = await PendingStudent.findOne({ _id: req.params.id, adminId: req.adminId });
        if (!pending) return res.status(404).json({ message: 'Pending registration not found' });

        const student = new Student({
            adminId: req.adminId,
            name: pending.name,
            address: pending.address,
            grade: pending.grade,
            school_name: pending.school_name,
            contact_info: pending.contact_info,
            admission_date: pending.admission_date,
            fee_status: {
                amount: pending.fee_amount || 0,
                feeStatus: [{ date: new Date(), paid: false }]
            }
        });
        await student.save();
        await PendingStudent.deleteOne({ _id: pending._id });
        res.json({ message: 'Student approved and added', student });
    } catch (err) {
        console.error('Approval error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A student with this email or phone already exists' });
        }
        res.status(500).json({ message: 'Approval failed' });
    }
});

router.delete('/pending/:id', userAuth, async (req, res) => {
    try {
        await PendingStudent.deleteOne({ _id: req.params.id, adminId: req.adminId });
        res.json({ message: 'Registration denied and removed' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove registration' });
    }
});

// ── Public routes ──

router.get('/:adminId/info', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.adminId)) {
            return res.status(400).json({ message: 'Invalid registration link' });
        }
        const institute = await Institute.findOne({ adminId: req.params.adminId });
        if (!institute) return res.status(404).json({ message: 'Institute not found' });

        const batches = await Batch.find({ adminId: req.params.adminId }, 'name forStandard subject');
        res.json({
            data: {
                instiName: institute.name,
                logo_URL: institute.logo_URL,
                batches
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to load institute info' });
    }
});

router.post('/:adminId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.adminId)) {
            return res.status(400).json({ message: 'Invalid registration link' });
        }
        const institute = await Institute.findOne({ adminId: req.params.adminId });
        if (!institute) return res.status(404).json({ message: 'Institute not found' });

        const { name, address, grade, school_name, contact_info, fee_amount, admission_date, forceAddAsTwin } = req.body;
        if (!name || !address || !grade || !school_name || !admission_date || !contact_info) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!forceAddAsTwin) {
            const duplicateQuery = {
                adminId: req.params.adminId,
                $or: [
                    { "contact_info.emailIds.student": contact_info.emailIds.student },
                    { "contact_info.phoneNumbers.student": contact_info.phoneNumbers.student }
                ]
            };

            const existingStudent = await Student.findOne(duplicateQuery);
            if (existingStudent) {
                return res.status(409).json({ 
                    message: "Student with same email or phone already exists",
                    isPotentialTwin: true,
                    existingStudentName: existingStudent.name
                });
            }

            const pendingDuplicate = await PendingStudent.findOne(duplicateQuery);
            if (pendingDuplicate) {
                return res.status(409).json({ 
                    message: "A pending registration with same email or phone already exists",
                    isPotentialTwin: true,
                    existingStudentName: pendingDuplicate.name
                });
            }
        }

        const pending = new PendingStudent({
            adminId: req.params.adminId,
            name, address,
            grade: Number(grade),
            school_name, contact_info,
            fee_amount: Number(fee_amount) || 0,
            admission_date: new Date(admission_date)
        });
        await pending.save();
        res.status(201).json({ message: 'Registration submitted successfully' });
    } catch (err) {
        console.error('Registration submit error:', err);
        res.status(500).json({ message: 'Failed to submit registration' });
    }
});

module.exports = router;
