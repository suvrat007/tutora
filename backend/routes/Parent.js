const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const ParentAuth = require('../models/ParentAuth.js');
const Student = require('../models/Student.js');
const Batch = require('../models/Batch.js');
const Test = require('../models/Test.js');
const ClassLog = require('../models/ClassLogSchema.js');
const Institute = require('../models/Institutes.js');

const userAuth = require('../middleware/userAuth.js');
const parentAuth = require('../middleware/parentAuth.js');

const isProd = process.env.NODE_ENV === 'production';
const parentCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 3600000 * 24 * 30,
};

// ─── Admin-triggered routes ───────────────────────────────────────────────────

// POST /invite — admin generates invite link for a parent
router.post('/invite', userAuth, async (req, res) => {
    try {
        const { studentId, relation } = req.body;
        if (!['mom', 'dad'].includes(relation)) {
            return res.status(400).json({ message: 'relation must be mom or dad' });
        }

        const student = await Student.findOne({ _id: studentId, adminId: req.adminId });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const email = student.contact_info?.emailIds?.[relation];
        if (!email) {
            return res.status(400).json({ message: `No ${relation} email on file for this student` });
        }

        const inviteToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await ParentAuth.findOneAndUpdate(
            { studentId, relation },
            { adminId: req.adminId, email, inviteToken, tokenExpiry, isActive: false, password: null },
            { upsert: true, new: true }
        );

        res.status(200).json({
            inviteToken,
            parentEmail: email,
            studentName: student.name
        });
    } catch (err) {
        console.error('invite error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /invite-status/:studentId — admin checks invite state for both parents
router.get('/invite-status/:studentId', userAuth, async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ _id: studentId, adminId: req.adminId });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const invites = await ParentAuth.find({ studentId, adminId: req.adminId }).select('relation email isActive tokenExpiry');
        res.status(200).json({ invites });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ─── Public routes ────────────────────────────────────────────────────────────

// GET /setup/:token — validate token and return display info for setup page
router.get('/setup/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const parentDoc = await ParentAuth.findOne({ inviteToken: token });

        if (!parentDoc || parentDoc.tokenExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired invite link' });
        }

        const student = await Student.findById(parentDoc.studentId).select('name');
        const institute = await Institute.findOne({ adminId: parentDoc.adminId }).select('name');

        res.status(200).json({
            email: parentDoc.email,
            relation: parentDoc.relation,
            studentName: student?.name || '',
            instituteName: institute?.name || ''
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /setup/:token — parent sets password, activates account
router.post('/setup/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const parentDoc = await ParentAuth.findOne({ inviteToken: token, isActive: false });
        if (!parentDoc || parentDoc.tokenExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired invite link' });
        }

        const hashed = await bcrypt.hash(password, 12);
        parentDoc.password = hashed;
        parentDoc.isActive = true;
        parentDoc.inviteToken = null;
        parentDoc.tokenExpiry = null;
        await parentDoc.save();

        const jwtToken = jwt.sign(
            { parentId: parentDoc._id, studentId: parentDoc.studentId, adminId: parentDoc.adminId, role: 'parent' },
            process.env.JWT_KEY,
            { expiresIn: '30d' }
        );
        res.cookie('parentToken', jwtToken, parentCookieOptions);

        res.status(201).json({ message: 'Account created successfully' });
    } catch (err) {
        console.error('setup error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const parentDoc = await ParentAuth.findOne({ email: email.toLowerCase().trim(), isActive: true });
        if (!parentDoc) return res.status(403).json({ message: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, parentDoc.password);
        if (!valid) return res.status(403).json({ message: 'Invalid credentials' });

        const jwtToken = jwt.sign(
            { parentId: parentDoc._id, studentId: parentDoc.studentId, adminId: parentDoc.adminId, role: 'parent' },
            process.env.JWT_KEY,
            { expiresIn: '30d' }
        );
        res.cookie('parentToken', jwtToken, parentCookieOptions);

        res.status(200).json({ message: 'Logged in successfully' });
    } catch (err) {
        console.error('parent login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /logout
router.post('/logout', (req, res) => {
    res.cookie('parentToken', null, { expires: new Date(Date.now()) });
    res.status(200).json({ message: 'Logged out successfully' });
});

// ─── Parent-authed data routes ────────────────────────────────────────────────

// GET /me — identity info
router.get('/me', parentAuth, async (req, res) => {
    try {
        const [parentDoc, student, institute] = await Promise.all([
            ParentAuth.findById(req.parentId).select('email relation'),
            Student.findById(req.studentId).select('name grade school_name admission_date batchId').populate('batchId', 'name forStandard'),
            Institute.findOne({ adminId: req.adminId }).select('name')
        ]);

        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.status(200).json({
            email: parentDoc.email,
            relation: parentDoc.relation,
            studentName: student.name,
            grade: student.grade,
            school_name: student.school_name,
            admission_date: student.admission_date,
            batchName: student.batchId?.name || null,
            forStandard: student.batchId?.forStandard || null,
            instituteName: institute?.name || ''
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /schedule — batch timetable
router.get('/schedule', parentAuth, async (req, res) => {
    try {
        const student = await Student.findById(req.studentId).select('batchId subjectId');
        if (!student?.batchId) return res.status(200).json({ subjects: [] });

        const batch = await Batch.findById(student.batchId).select('name subject');
        if (!batch) return res.status(200).json({ subjects: [] });

        // Filter to only subjects the student is enrolled in
        const enrolledIds = (student.subjectId || []).map(id => id.toString());
        const subjects = batch.subject
            .filter(s => enrolledIds.includes(s._id.toString()))
            .map(s => ({
                subjectId: s._id,
                subjectName: s.name,
                startDate: s.startDate,
                days: s.classSchedule.days,
                time: s.classSchedule.time
            }));

        res.status(200).json({ batchName: batch.name, subjects });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /fees — monthly fee history
router.get('/fees', parentAuth, async (req, res) => {
    try {
        const student = await Student.findById(req.studentId).select('fee_status');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const history = [...(student.fee_status.feeStatus || [])]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(entry => ({
                date: entry.date,
                paid: entry.paid,
                paid_at: entry.paid_at || null
            }));

        res.status(200).json({
            amount: student.fee_status.amount,
            history
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /tests — all completed tests for this student
router.get('/tests', parentAuth, async (req, res) => {
    try {
        const studentObjId = new mongoose.Types.ObjectId(req.studentId);
        const subjectFilter = req.query.subjectId;

        const query = {
            adminId: new mongoose.Types.ObjectId(req.adminId),
            status: 'completed',
            'studentResults.studentId': studentObjId
        };
        if (subjectFilter) query.subjectId = new mongoose.Types.ObjectId(subjectFilter);

        const tests = await Test.find(query).sort({ testDate: -1 });

        // Bulk fetch batches to get subject names
        const batchIds = [...new Set(tests.filter(t => t.batchId).map(t => t.batchId.toString()))];
        const batches = await Batch.find({ _id: { $in: batchIds } }).select('subject');
        const batchMap = {};
        batches.forEach(b => { batchMap[b._id.toString()] = b; });

        const results = tests.map(test => {
            const result = test.studentResults.find(
                r => r.studentId.toString() === req.studentId.toString()
            );
            let subjectName = 'Unknown';
            if (test.batchId && test.subjectId) {
                const batch = batchMap[test.batchId.toString()];
                const subj = batch?.subject?.id(test.subjectId);
                if (subj) subjectName = subj.name;
            }
            return {
                testId: test._id,
                testName: test.testName,
                testDate: test.testDate,
                subjectId: test.subjectId,
                subjectName,
                maxMarks: test.maxMarks,
                passMarks: test.passMarks,
                marks: result?.marks ?? 0,
                appeared: result?.appeared ?? false,
                passed: (result?.appeared ?? false) && (result?.marks ?? 0) >= test.passMarks
            };
        });

        res.status(200).json({ tests: results });
    } catch (err) {
        console.error('parent /tests error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /attendance — per-subject attendance with classDates for heatmap
router.get('/attendance', parentAuth, async (req, res) => {
    try {
        const adminId = new mongoose.Types.ObjectId(req.adminId);
        const studentObjId = new mongoose.Types.ObjectId(req.studentId);

        const student = await Student.findById(req.studentId).select('batchId subjectId admission_date');
        if (!student?.batchId) return res.status(200).json({ subjects: [] });

        const batch = await Batch.findById(student.batchId).select('subject');
        if (!batch) return res.status(200).json({ subjects: [] });

        const enrolledSubjectIds = (student.subjectId || []).map(id => id.toString());
        const enrolledSubjects = batch.subject.filter(s => enrolledSubjectIds.includes(s._id.toString()));

        const admissionDateStr = student.admission_date
            ? student.admission_date.toISOString().split('T')[0]
            : '2000-01-01';

        const subjectResults = await Promise.all(
            enrolledSubjects.map(async (subj) => {
                const classLog = await ClassLog.findOne({
                    adminId,
                    batch_id: student.batchId,
                    subject_id: subj._id
                });

                if (!classLog) {
                    return { subjectId: subj._id, subjectName: subj.name, attended: 0, total: 0, percentage: 0, classDates: [] };
                }

                const heldClasses = classLog.classes.filter(
                    c => c.hasHeld && c.updated && c.date >= admissionDateStr
                );

                const classDates = heldClasses.map(c => {
                    const attended = c.attendance.some(
                        a => a.studentIds && a.studentIds.toString() === req.studentId.toString()
                    );
                    return { date: c.date, attended };
                });

                const attended = classDates.filter(d => d.attended).length;
                const total = classDates.length;
                const percentage = total === 0 ? 0 : Math.round((attended / total) * 100 * 100) / 100;

                return { subjectId: subj._id, subjectName: subj.name, attended, total, percentage, classDates };
            })
        );

        res.status(200).json({ subjects: subjectResults });
    } catch (err) {
        console.error('parent /attendance error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /dashboard — aggregated overview for the dashboard page
router.get('/dashboard', parentAuth, async (req, res) => {
    try {
        const adminId = new mongoose.Types.ObjectId(req.adminId);
        const studentObjId = new mongoose.Types.ObjectId(req.studentId);

        const student = await Student.findById(req.studentId)
            .select('name grade school_name admission_date batchId subjectId fee_status')
            .populate('batchId', 'name forStandard subject');

        if (!student) return res.status(404).json({ message: 'Student not found' });

        // ── Current month fee ──
        const now = new Date();
        const currentMonthFeeEntry = student.fee_status.feeStatus.find(fs => {
            const d = new Date(fs.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const currentMonthFee = {
            paid: currentMonthFeeEntry?.paid ?? false,
            amount: student.fee_status.amount,
            paid_at: currentMonthFeeEntry?.paid_at ?? null
        };

        // ── Overall attendance % (average across subjects) ──
        let overallAttendancePct = 0;
        if (student.batchId) {
            const enrolledIds = (student.subjectId || []).map(id => id.toString());
            const enrolledSubjects = student.batchId.subject.filter(s => enrolledIds.includes(s._id.toString()));
            const admissionDateStr = student.admission_date?.toISOString().split('T')[0] || '2000-01-01';

            if (enrolledSubjects.length > 0) {
                const perSubject = await Promise.all(
                    enrolledSubjects.map(async (subj) => {
                        const classLog = await ClassLog.findOne({
                            adminId,
                            batch_id: student.batchId._id,
                            subject_id: subj._id
                        });
                        if (!classLog) return 0;
                        const held = classLog.classes.filter(c => c.hasHeld && c.updated && c.date >= admissionDateStr);
                        const attended = held.filter(c =>
                            c.attendance.some(a => a.studentIds?.toString() === req.studentId.toString())
                        ).length;
                        return held.length === 0 ? 0 : (attended / held.length) * 100;
                    })
                );
                const sum = perSubject.reduce((a, b) => a + b, 0);
                overallAttendancePct = Math.round((sum / enrolledSubjects.length) * 100) / 100;
            }
        }

        // ── Next class ──
        let nextClass = null;
        if (student.batchId) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayIdx = now.getDay();
            let best = null;
            const enrolledIds = (student.subjectId || []).map(id => id.toString());

            for (const subj of student.batchId.subject) {
                if (!enrolledIds.includes(subj._id.toString())) continue;
                for (const day of subj.classSchedule.days) {
                    const dayIdx = dayNames.indexOf(day);
                    if (dayIdx === -1) continue;
                    let diff = dayIdx - todayIdx;
                    if (diff < 0) diff += 7;
                    if (diff === 0) diff = 7; // if today, show next week
                    if (best === null || diff < best.diff) {
                        best = { diff, subjectName: subj.name, day, time: subj.classSchedule.time };
                    }
                }
            }
            if (best) nextClass = { subjectName: best.subjectName, day: best.day, time: best.time };
        }

        // ── Upcoming tests (next 2 scheduled) ──
        const upcomingTests = await Test.find({
            adminId,
            status: 'scheduled',
            'studentResults.studentId': studentObjId,
            testDate: { $gte: now }
        })
            .sort({ testDate: 1 })
            .limit(2)
            .select('testName testDate subjectId batchId maxMarks');

        // Attach subject names
        const enrichedTests = await Promise.all(
            upcomingTests.map(async test => {
                let subjectName = 'Unknown';
                if (test.batchId && test.subjectId) {
                    const b = await Batch.findById(test.batchId).select('subject');
                    const subj = b?.subject?.id(test.subjectId);
                    if (subj) subjectName = subj.name;
                }
                return { testName: test.testName, testDate: test.testDate, subjectName, maxMarks: test.maxMarks };
            })
        );

        res.status(200).json({
            student: {
                name: student.name,
                grade: student.grade,
                school_name: student.school_name,
                admission_date: student.admission_date,
                batchName: student.batchId?.name || null
            },
            overallAttendancePct,
            currentMonthFee,
            nextClass,
            upcomingTests: enrichedTests
        });
    } catch (err) {
        console.error('parent /dashboard error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
