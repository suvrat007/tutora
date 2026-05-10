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
        const { testName, batchId, subjectId, maxMarks, passMarks, testDate, status, studentResults = [], groupId } = req.body;
        
        let initialStudentResults = studentResults;
        if (initialStudentResults.length === 0 && batchId) {
            // Automatically allocate test to respective students in the batch
            const studentsInBatch = await Student.find({ batchId, adminId: req.adminId });
            initialStudentResults = studentsInBatch.map(student => ({
                studentId: student._id,
                appeared: false,
                marks: 0
            }));
        }

        const newTest = new Test({
            adminId: req.adminId,
            testName,
            batchId,
            subjectId,
            maxMarks,
            passMarks: passMarks || 0,
            testDate,
            status,
            groupId: groupId || undefined,
            studentResults: initialStudentResults
        });
        await newTest.save();

        if (status === 'scheduled') {
            const batch = newTest.batchId ? await Batch.findById(newTest.batchId) : null;
            const subject = (batch && newTest.subjectId) ? batch.subject.id(newTest.subjectId) : null;

            let reminderMessage = `Test: ${newTest.testName}`;
            if (groupId) {
                reminderMessage += ` (All Batches)`;
            } else if (batch && subject) {
                reminderMessage += ` for ${subject.name} in ${batch.name}`;
            } else if (batch) {
                reminderMessage += ` in ${batch.name}`;
            }

            if (groupId) {
                // For all-batch tests: upsert so only one reminder is created regardless of concurrent requests
                await Reminder.findOneAndUpdate(
                    { adminId: req.adminId, groupId },
                    { $setOnInsert: {
                        adminId: req.adminId,
                        reminderDate: newTest.testDate,
                        reminder: reminderMessage,
                        groupId,
                    }},
                    { upsert: true }
                );
            } else {
                const newReminder = new Reminder({
                    adminId: req.adminId,
                    reminderDate: newTest.testDate,
                    reminder: reminderMessage,
                    batchName: batch ? batch.name : undefined,
                    subjectName: subject ? subject.name : undefined,
                });
                await newReminder.save();
            }
        }

        res.status(201).json(newTest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all tests for a batch with optional filtering
router.get('/getAllTests', userAuth, async (req, res) => {
    try {
        const query = { adminId: req.adminId };
        if (req.query.batchId) {
            query.batchId = req.query.batchId;
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            Test.countDocuments(query),
            Test.find(query)
                .populate('studentResults.studentId', 'name grade')
                .sort({ testDate: -1 })
                .skip(skip).limit(limit)
        ]);

        res.json({ data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
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
        const { testName, batchId, subjectId, maxMarks, passMarks, testDate, status, cancellationReason, studentResults } = req.body;

        if (status === 'cancelled' && !cancellationReason) {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }

        const updateData = {
            testName,
            batchId,
            subjectId,
            maxMarks,
            passMarks,
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

// Update all tests in a group (common fields only, not studentResults)
router.put('/updateGroupTest/:groupId', userAuth, async (req, res) => {
    try {
        const { testName, maxMarks, passMarks, testDate, status, cancellationReason } = req.body;
        if (status === 'cancelled' && !cancellationReason) {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }
        await Test.updateMany(
            { groupId: req.params.groupId, adminId: req.adminId },
            { testName, maxMarks, passMarks, testDate, status, cancellationReason }
        );
        const updated = await Test.find({ groupId: req.params.groupId, adminId: req.adminId })
            .populate('studentResults.studentId', 'name grade');
        res.json({ tests: updated });
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

// Public: get group test info + all students across all batches
// Must be defined before GET /public/:testId to avoid "group" being matched as a testId
router.get('/public/group/:groupId', async (req, res) => {
    try {
        const tests = await Test.find({ groupId: req.params.groupId }).populate('batchId', 'name');
        if (!tests.length) return res.status(404).json({ message: 'Test not found' });
        if (tests[0].status === 'cancelled') return res.status(400).json({ message: 'This test has been cancelled' });

        const allStudents = [];
        for (const test of tests) {
            if (!test.batchId) continue;
            const students = await Student.find({ batchId: test.batchId._id }, 'name grade').sort('name');
            students.forEach(s => {
                const result = test.studentResults.find(r => r.studentId.toString() === s._id.toString());
                allStudents.push({
                    _id: s._id,
                    name: s.name,
                    grade: s.grade,
                    batchName: test.batchId.name,
                    appeared: result?.appeared || false,
                });
            });
        }

        const first = tests[0];
        res.json({
            testName: first.testName,
            testDate: first.testDate,
            maxMarks: first.maxMarks,
            passMarks: first.passMarks,
            status: first.status,
            isGroup: true,
            students: allStudents,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public: get single test info + student list (with appeared status)
router.get('/public/:testId', async (req, res) => {
    try {
        const test = await Test.findById(req.params.testId).populate('batchId', 'name');
        if (!test) return res.status(404).json({ message: 'Test not found' });
        if (test.status === 'cancelled') return res.status(400).json({ message: 'This test has been cancelled' });

        const students = test.batchId
            ? await Student.find({ batchId: test.batchId._id }, 'name grade').sort('name')
            : [];

        res.json({
            testName: test.testName,
            testDate: test.testDate,
            maxMarks: test.maxMarks,
            passMarks: test.passMarks,
            status: test.status,
            batchName: test.batchId?.name,
            students: students.map(s => {
                const result = test.studentResults.find(r => r.studentId.toString() === s._id.toString());
                return { _id: s._id, name: s.name, grade: s.grade, appeared: result?.appeared || false };
            }),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public: submit marks for a group test (backend resolves which batch's test via student's batchId)
// Must be defined before POST /public/submit/:testId
router.post('/public/submit/group/:groupId', async (req, res) => {
    try {
        const { studentId, marks } = req.body;
        if (!studentId || marks === undefined || marks === null) {
            return res.status(400).json({ message: 'studentId and marks are required' });
        }

        const student = await Student.findById(studentId, 'batchId');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const test = await Test.findOne({ groupId: req.params.groupId, batchId: student.batchId });
        if (!test) return res.status(404).json({ message: 'Test not found for your batch' });
        if (test.status === 'cancelled') return res.status(400).json({ message: 'This test has been cancelled' });

        const marksNum = Number(marks);
        if (isNaN(marksNum) || marksNum < 0 || marksNum > test.maxMarks) {
            return res.status(400).json({ message: `Marks must be between 0 and ${test.maxMarks}` });
        }

        const existing = test.studentResults.find(r => r.studentId.toString() === studentId);
        if (existing?.appeared) {
            return res.status(400).json({ message: 'Marks already submitted for this test' });
        }
        if (existing) {
            existing.marks = marksNum;
            existing.appeared = true;
        } else {
            test.studentResults.push({ studentId, marks: marksNum, appeared: true });
        }

        await test.save();
        res.json({ message: 'Marks submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public: submit marks for a single test
router.post('/public/submit/:testId', async (req, res) => {
    try {
        const { studentId, marks } = req.body;
        if (!studentId || marks === undefined || marks === null) {
            return res.status(400).json({ message: 'studentId and marks are required' });
        }

        const test = await Test.findById(req.params.testId);
        if (!test) return res.status(404).json({ message: 'Test not found' });
        if (test.status === 'cancelled') return res.status(400).json({ message: 'This test has been cancelled' });

        const marksNum = Number(marks);
        if (isNaN(marksNum) || marksNum < 0 || marksNum > test.maxMarks) {
            return res.status(400).json({ message: `Marks must be between 0 and ${test.maxMarks}` });
        }

        const existing = test.studentResults.find(r => r.studentId.toString() === studentId);
        if (existing?.appeared) {
            return res.status(400).json({ message: 'Marks already submitted for this test' });
        }
        if (existing) {
            existing.marks = marksNum;
            existing.appeared = true;
        } else {
            test.studentResults.push({ studentId, marks: marksNum, appeared: true });
        }

        await test.save();
        res.json({ message: 'Marks submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;