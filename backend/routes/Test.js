// Modified backend routes
const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Student = require('../models/Student');
const Reminder = require('../models/ReminderSchema');
const userAuth = require('../middleware/userAuth');
const Batch = require('../models/Batch');

// Create a new test (schedule or log)
router.post('/createTest', userAuth, async (req, res) => {
    try {
        const { testName, batchId, subjectId, maxMarks, testDate, status, studentResults = [] } = req.body;
        const newTest = new Test({
            adminId: req.user._id,
            testName,
            batchId,
            subjectId,
            maxMarks,
            testDate,
            status,
            studentResults
        });
        await newTest.save();

        if (status === 'scheduled') {
            const batch = await Batch.findById(newTest.batchId);
            const subject = batch ? batch.subject.id(newTest.subjectId) : null;

            let reminderMessage = `Test: ${newTest.testName}`;
            if (batch && subject) {
                reminderMessage += ` for ${subject.name} in ${batch.name}`;
            } else if (batch) {
                reminderMessage += ` in ${batch.name}`;
            }

            const newReminder = new Reminder({
                adminId: req.user._id,
                batchId: newTest.batchId.toString(),
                subjectId: newTest.subjectId,
                reminderDate: newTest.testDate,
                reminder: reminderMessage,
                batchName: batch ? batch.name : undefined,
                subjectName: subject ? subject.name : undefined
            });
            await newReminder.save();
        }

        res.status(201).json(newTest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all tests for a batch with optional filtering
router.get('/getAllTests', userAuth, async (req, res) => {
    try {
        const query = { adminId: req.user._id };
        if (req.query.batchId) {
            query.batchId = req.query.batchId;
        }
        const tests = await Test.find(query).populate('batchId', 'name').populate('studentResults.studentId', 'name grade');

        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single test by ID
router.get('/getTestById/:testId', userAuth, async (req, res) => {
    try {
        const test = await Test.findById(req.params.testId).populate('batchId', 'name').populate('studentResults.studentId', 'name grade');
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a test
router.put('/updateTest/:testId', userAuth, async (req, res) => {
    try {
        const { testName, batchId, subjectId, maxMarks, testDate, status, cancellationReason, studentResults } = req.body;

        if (status === 'cancelled' && !cancellationReason) {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }

        const updateData = {
            testName,
            batchId,
            subjectId,
            maxMarks,
            testDate,
            status,
            cancellationReason
        };

        if (studentResults) {
            updateData.studentResults = studentResults;
        }

        const updatedTest = await Test.findByIdAndUpdate(req.params.testId, updateData, { new: true });
        res.json(updatedTest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a test
router.delete('/:testId', userAuth, async (req, res) => {
    try {
        const test = await Test.findByIdAndDelete(req.params.testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;