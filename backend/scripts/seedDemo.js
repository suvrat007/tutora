/**
 * Seeds (or re-seeds) the guest-demo tenant - the institute a visitor sees when
 * they click "Explore as guest" on the login page.
 *
 *   npm run seed:demo
 *
 * Safety: every destructive query in here is filtered by the _id of an Admin
 * document whose `isDemo` flag is true, and the script aborts before touching
 * anything if that invariant doesn't hold. It is structurally incapable of
 * deleting a real tenant's data.
 *
 * Every date is computed relative to run time, so a demo seeded months ago
 * still shows "this week's" classes and "this month's" fees.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { connectDb } = require('../utils/databaseConnection');
const Admin = require('../models/Admin');
const Institute = require('../models/Institutes');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const ClassLog = require('../models/ClassLogSchema');
const Test = require('../models/Test');
const Teacher = require('../models/All_Teachers_Schema');
const Reminder = require('../models/ReminderSchema');
const PendingStudent = require('../models/PendingStudent');
const ParentAuth = require('../models/ParentAuth');

const DEMO_EMAIL = 'demo@tutora.invalid'; // .invalid is reserved (RFC 2606) - nobody can ever own it
const DEMO_INSTITUTE = 'Bright Minds Academy';

/* ----------------------------------------------------------------- helpers */

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const daysAgo = (n) => new Date(Date.now() - n * DAY_MS);
const daysAhead = (n) => new Date(Date.now() + n * DAY_MS);
const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/**
 * First of the month, `back` months ago, **in UTC**.
 *
 * This has to be UTC. The fee pipelines in routes/Student.js compare
 * `{ $month: date }` (which Mongo evaluates in UTC) against a target derived
 * from `getUTCMonth()`, and FeesTable.jsx writes toggles as
 * `Date.UTC(year, month, 1)`. A local-time month start would land at
 * 18:30 UTC on the last day of the *previous* month for an IST viewer, and
 * every seeded fee row would show up under the wrong month.
 */
const monthStartUTC = (back = 0) => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
};

/** Deterministic-ish pseudo-random so a re-seed produces a similarly shaped demo. */
let seedState = 42;
const rand = () => {
    seedState = (seedState * 1103515245 + 12345) % 2147483648;
    return seedState / 2147483648;
};
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1));
const pick = (arr) => arr[randInt(0, arr.length - 1)];

/** Every date in the last `weeks` weeks falling on one of `days`. */
const datesForSchedule = (days, weeks) => {
    const out = [];
    for (let back = weeks * 7; back >= 0; back -= 1) {
        const d = daysAgo(back);
        if (days.includes(DAY_NAMES[d.getDay()])) out.push(d);
    }
    return out;
};

/* -------------------------------------------------------------- demo content */

const BATCH_BLUEPRINTS = [
    {
        name: 'Class 10 - Science',
        forStandard: '10',
        teacherInCharge: 'Ananya Iyer',
        subjects: [
            { name: 'Physics', days: ['Monday', 'Wednesday', 'Friday'], time: '16:00' },
            { name: 'Chemistry', days: ['Tuesday', 'Thursday'], time: '17:00' },
        ],
    },
    {
        name: 'Class 10 - Mathematics',
        forStandard: '10',
        teacherInCharge: 'Rohan Deshmukh',
        subjects: [{ name: 'Mathematics', days: ['Monday', 'Tuesday', 'Thursday'], time: '18:00' }],
    },
    {
        name: 'Class 12 - PCM',
        forStandard: '12',
        teacherInCharge: 'Ananya Iyer',
        subjects: [
            { name: 'Physics', days: ['Monday', 'Wednesday', 'Friday'], time: '07:00' },
            { name: 'Mathematics', days: ['Tuesday', 'Thursday', 'Saturday'], time: '07:00' },
        ],
    },
    {
        name: 'Class 9 - Weekend Foundation',
        forStandard: '9',
        teacherInCharge: 'Meera Raghavan',
        // Saturday + Sunday matters: between the five batches every weekday must
        // be covered, or a visitor who drops in on a quiet day sees an empty
        // "Today's Classes" card as the very first thing on the dashboard.
        subjects: [{ name: 'Science', days: ['Saturday', 'Sunday'], time: '10:00' }],
    },
    {
        name: 'Class 8 - Basics',
        forStandard: '8',
        teacherInCharge: 'Meera Raghavan',
        subjects: [{ name: 'Mathematics', days: ['Tuesday', 'Friday'], time: '15:00' }],
    },
];

// Invented names, example.com addresses, obviously-placeholder phone numbers.
const FIRST_NAMES = [
    'Aarav', 'Diya', 'Vihaan', 'Ananya', 'Arjun', 'Ishita', 'Kabir', 'Saanvi', 'Reyansh', 'Myra',
    'Aditya', 'Kiara', 'Vivaan', 'Anika', 'Krishna', 'Navya', 'Rudra', 'Aadhya', 'Shaurya', 'Pari',
    'Dhruv', 'Riya', 'Advik', 'Tara', 'Neel', 'Meher', 'Ayaan', 'Zoya',
];
const LAST_NAMES = [
    'Sharma', 'Verma', 'Nair', 'Reddy', 'Kulkarni', 'Banerjee', 'Chauhan', 'Pillai',
    'Joshi', 'Mehta', 'Gupta', 'Rao',
];
const SCHOOLS = [
    'Delhi Public School', 'St. Xavier High School', 'Ryan International', 'Kendriya Vidyalaya',
    'Bal Bharati Public School', 'City Montessori School',
];
const AREAS = [
    '12 Rose Villa, Koramangala', '44 Green Park Road', '8B Lake View Apartments',
    '221 Hill Crest Colony', '17 Sunrise Enclave', '5 Palm Grove Street',
];

const TEACHER_BLUEPRINTS = [
    { name: 'Ananya Iyer', qualification: 'M.Sc. Physics, B.Ed.', email: 'ananya.iyer@example.com', phone: '+91 90000 10001' },
    { name: 'Rohan Deshmukh', qualification: 'M.Sc. Mathematics', email: 'rohan.deshmukh@example.com', phone: '+91 90000 10002' },
    { name: 'Meera Raghavan', qualification: 'B.Sc. B.Ed.', email: 'meera.raghavan@example.com', phone: '+91 90000 10003' },
    { name: 'Imran Qureshi', qualification: 'M.Sc. Chemistry', email: 'imran.qureshi@example.com', phone: '+91 90000 10004' },
];

const CANCEL_NOTES = [
    'Cancelled - teacher unwell',
    'Cancelled - public holiday',
    'Cancelled - school exams',
];

/* ------------------------------------------------------------------- seeding */

async function wipeDemoData(adminId) {
    // Every one of these is scoped to the verified demo admin.
    const scoped = { adminId };
    await Promise.all([
        Batch.deleteMany(scoped),
        Student.deleteMany(scoped),
        ClassLog.deleteMany(scoped),
        Test.deleteMany(scoped),
        Teacher.deleteMany(scoped),
        Reminder.deleteMany(scoped),
        PendingStudent.deleteMany(scoped),
        ParentAuth.deleteMany(scoped),
    ]);
}

async function ensureDemoAdmin() {
    const existing = await Admin.find({ isDemo: true });
    if (existing.length > 1) {
        throw new Error(
            `Found ${existing.length} admins flagged isDemo. Refusing to guess which one to re-seed - ` +
            'clean this up by hand first.'
        );
    }

    // The password is random and never printed, so nobody can log in as the demo
    // admin even if the isDemo login guard were ever removed.
    const password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

    let admin = existing[0];
    if (admin) {
        admin.name = 'Demo Tutor';
        admin.emailId = DEMO_EMAIL;
        admin.password = password;
        await admin.save();
    } else {
        admin = await Admin.create({
            name: 'Demo Tutor',
            emailId: DEMO_EMAIL,
            password,
            isDemo: true,
            adminPicURL: 'https://www.svgrepo.com/show/527961/user.svg',
        });
    }

    if (!admin.isDemo) throw new Error('Demo admin is missing the isDemo flag - aborting.');
    return admin;
}

async function ensureInstitute(admin) {
    let institute = await Institute.findOne({ adminId: admin._id });
    const fields = {
        adminId: admin._id,
        name: DEMO_INSTITUTE,
        logo_URL: '',
        contact_info: { emailId: 'hello@example.com', phone_number: '+91 90000 00000' },
    };

    if (institute) {
        Object.assign(institute, fields);
        await institute.save();
    } else {
        institute = await Institute.create(fields);
    }

    // ProtectedRoute requires institute_info.name, so this link must exist or a
    // guest lands in the onboarding form instead of the dashboard.
    admin.institute_info = institute._id;
    await admin.save();
    return institute;
}

async function seedBatches(adminId) {
    return Batch.create(
        BATCH_BLUEPRINTS.map((b) => ({
            adminId,
            name: b.name,
            normalized_name: b.name.replace(/\s+/g, '').toLowerCase(),
            forStandard: b.forStandard,
            teacherInCharge: b.teacherInCharge,
            subject: b.subjects.map((s) => ({
                name: s.name,
                startDate: daysAgo(80),
                classSchedule: { time: s.time, days: s.days },
            })),
        }))
    );
}

async function seedStudents(adminId, batches) {
    const docs = [];
    let nameIdx = 0;

    batches.forEach((batch, batchIdx) => {
        const count = [7, 6, 5, 5, 5][batchIdx] ?? 5;
        for (let i = 0; i < count; i += 1) {
            const first = FIRST_NAMES[nameIdx % FIRST_NAMES.length];
            const last = LAST_NAMES[(nameIdx * 3) % LAST_NAMES.length];
            nameIdx += 1;
            const handle = `${first}.${last}`.toLowerCase();
            const amount = [1200, 1500, 1800, 2200, 2500, 3000][randInt(0, 5)];

            // Four months of fee rows: older months mostly settled, the current
            // month deliberately mixed so the dashboard has something to show.
            const feeStatus = [];
            for (let back = 3; back >= 0; back -= 1) {
                const date = monthStartUTC(back);
                const paid = back === 0 ? rand() < 0.45 : rand() < 0.88;
                feeStatus.push({
                    date,
                    paid,
                    paid_at: paid ? new Date(date.getTime() + randInt(1, 12) * DAY_MS) : null,
                });
            }

            docs.push({
                adminId,
                batchId: batch._id,
                subjectId: batch.subject.map((s) => s._id),
                name: `${first} ${last}`,
                address: pick(AREAS),
                admission_date: daysAgo(randInt(40, 330)),
                grade: Number(batch.forStandard),
                school_name: pick(SCHOOLS),
                contact_info: {
                    emailIds: {
                        student: `${handle}@example.com`,
                        mom: `${handle}.mom@example.com`,
                        dad: `${handle}.dad@example.com`,
                    },
                    phoneNumbers: {
                        student: `+91 90000 2${pad2(nameIdx)}${randInt(10, 99)}`,
                        mom: `+91 90000 3${pad2(nameIdx)}${randInt(10, 99)}`,
                        dad: `+91 90000 4${pad2(nameIdx)}${randInt(10, 99)}`,
                    },
                },
                fee_status: { amount, feeStatus },
                // No seeded biometrics: a real descriptor would embed a real
                // person's face, and a random one would simply never match.
                face_descriptor: { descriptor: null, has_face: false, registered_at: null },
            });
        }
    });

    return Student.create(docs);
}

async function seedClassLogs(adminId, batches, studentsByBatch) {
    const docs = [];

    batches.forEach((batch) => {
        const roster = studentsByBatch.get(String(batch._id)) ?? [];

        batch.subject.forEach((subject) => {
            const dates = datesForSchedule(subject.classSchedule.days, 10);
            let cancelled = 0;

            const today = ymd(new Date());

            const classes = dates.map((date) => {
                // Today's sessions are seeded as unmarked on purpose: it gives the
                // guest something to actually do, and the dashboard's "pending"
                // nudges need it. Body.jsx normally POSTs these into existence on
                // load, but that write is faked for a guest - so the seed has to
                // provide them.
                if (ymd(date) === today) {
                    return { date: today, hasHeld: false, note: 'No Data', attendance: [], updated: false };
                }

                // A couple of cancelled sessions per subject keeps it believable.
                const isCancelled = cancelled < 2 && rand() < 0.04;
                if (isCancelled) {
                    cancelled += 1;
                    return {
                        date: ymd(date),
                        hasHeld: false,
                        note: pick(CANCEL_NOTES),
                        attendance: [],
                        updated: true,
                    };
                }

                const present = roster.filter(() => rand() < 0.9);
                return {
                    date: ymd(date),
                    hasHeld: true,
                    note: 'Class held as scheduled',
                    attendance: present.map((s) => ({
                        studentIds: s._id,
                        time: subject.classSchedule.time,
                    })),
                    updated: true,
                };
            });

            docs.push({ adminId, batch_id: batch._id, subject_id: subject._id, classes });
        });
    });

    return ClassLog.create(docs);
}

async function seedTests(adminId, batches, studentsByBatch) {
    const docs = [];

    const completed = (batch, subject, name, daysBack, maxMarks) => {
        const roster = studentsByBatch.get(String(batch._id)) ?? [];
        return {
            testName: name,
            adminId,
            batchId: batch._id,
            subjectId: subject._id,
            maxMarks,
            passMarks: Math.round(maxMarks * 0.33),
            testDate: daysAgo(daysBack),
            status: 'completed',
            groupId: crypto.randomUUID(),
            studentResults: roster.map((s) => {
                const appeared = rand() < 0.94;
                return {
                    studentId: s._id,
                    appeared,
                    // Bell-ish spread so the marks chart isn't a flat line.
                    marks: appeared ? Math.min(maxMarks, randInt(Math.round(maxMarks * 0.35), maxMarks)) : 0,
                };
            }),
        };
    };

    const upcoming = (batch, subject, name, daysOut, maxMarks) => ({
        testName: name,
        adminId,
        batchId: batch._id,
        subjectId: subject._id,
        maxMarks,
        passMarks: Math.round(maxMarks * 0.33),
        testDate: daysAhead(daysOut),
        status: 'scheduled',
        groupId: crypto.randomUUID(),
        studentResults: (studentsByBatch.get(String(batch._id)) ?? []).map((s) => ({
            studentId: s._id,
            appeared: false,
            marks: 0,
        })),
    });

    docs.push(completed(batches[0], batches[0].subject[0], 'Physics - Unit Test 1', 34, 25));
    docs.push(completed(batches[0], batches[0].subject[1], 'Chemistry - Monthly Test', 12, 50));
    docs.push(completed(batches[2], batches[2].subject[1], 'Mathematics - Mock Paper', 20, 100));
    docs.push(upcoming(batches[1], batches[1].subject[0], 'Mathematics - Unit Test 2', 6, 25));
    docs.push(upcoming(batches[3], batches[3].subject[0], 'Science - Term Revision', 13, 40));

    docs.push({
        ...upcoming(batches[4], batches[4].subject[0], 'Mathematics - Surprise Test', 3, 20),
        status: 'cancelled',
        cancellationReason: 'Rescheduled after the school annual day',
    });

    return Test.create(docs);
}

async function seedTeachers(adminId, batches) {
    const byName = new Map(batches.map((b) => [b.name, b]));
    const assign = (names) =>
        names.map((n) => byName.get(n)).filter(Boolean);

    const plan = [
        { t: TEACHER_BLUEPRINTS[0], batches: ['Class 10 - Science', 'Class 12 - PCM'] },
        { t: TEACHER_BLUEPRINTS[1], batches: ['Class 10 - Mathematics', 'Class 12 - PCM'] },
        { t: TEACHER_BLUEPRINTS[2], batches: ['Class 9 - Foundation', 'Class 8 - Basics'] },
        { t: TEACHER_BLUEPRINTS[3], batches: ['Class 10 - Science'] },
    ];

    return Teacher.create(
        plan.map(({ t, batches: names }) => {
            const assigned = assign(names);
            return {
                adminId,
                name: t.name,
                qualification: t.qualification,
                contact_info: { emailId: t.email, phoneNumber: t.phone },
                teaching_batches: assigned.map((b) => ({ batch_id: b._id })),
                subjects: assigned.flatMap((b) => b.subject.map((s) => ({ batch_id: b._id, subject_id: s._id }))),
                classes_taken: [],
            };
        })
    );
}

async function seedReminders(adminId, batches) {
    return Reminder.create([
        {
            adminId,
            batchName: batches[0].name,
            subjectName: 'Physics',
            reminderDate: daysAhead(1),
            reminder: 'Hand back the corrected unit test papers',
            groupId: crypto.randomUUID(),
        },
        {
            adminId,
            batchName: batches[2].name,
            subjectName: 'Mathematics',
            reminderDate: daysAhead(3),
            reminder: 'Share the mock paper solutions with the PCM group',
            groupId: crypto.randomUUID(),
        },
        {
            adminId,
            batchName: batches[1].name,
            subjectName: 'Mathematics',
            reminderDate: daysAhead(5),
            reminder: 'Call parents of students below 40% attendance',
            groupId: crypto.randomUUID(),
        },
        {
            adminId,
            batchName: batches[3].name,
            subjectName: 'Science',
            reminderDate: daysAhead(8),
            reminder: 'Book the lab for the practical revision session',
            groupId: crypto.randomUUID(),
        },
    ]);
}

async function seedPendingStudents(adminId) {
    const rows = [
        { name: 'Ira Malhotra', grade: 10, school: 'Delhi Public School' },
        { name: 'Veer Chandra', grade: 9, school: 'Ryan International' },
        { name: 'Sara Dutta', grade: 12, school: 'St. Xavier High School' },
    ];

    return PendingStudent.create(
        rows.map((r, i) => {
            const handle = r.name.replace(/\s+/g, '.').toLowerCase();
            return {
                adminId,
                name: r.name,
                address: pick(AREAS),
                grade: r.grade,
                school_name: r.school,
                contact_info: {
                    emailIds: { student: `${handle}@example.com`, mom: '', dad: '' },
                    phoneNumbers: { student: `+91 90000 5${pad2(i)}${randInt(10, 99)}`, mom: '', dad: '' },
                },
                fee_amount: [1500, 1800, 2500][i],
                admission_date: daysAhead(randInt(1, 10)),
                submittedAt: daysAgo(randInt(1, 6)),
            };
        })
    );
}

async function seedDemoParent(adminId, student) {
    // No usable password: the parent-portal preview mints its own short-lived
    // token, so there is nothing here for an outsider to log in with.
    const password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
    return ParentAuth.create({
        studentId: student._id,
        adminId,
        email: student.contact_info.emailIds.mom,
        relation: 'mom',
        password,
        // Deliberately inactive: POST /parent/login filters on { isActive: true },
        // so this account cannot be logged into by anyone. parentAuth itself never
        // checks isActive, so the short-lived token the guest preview mints still
        // works - the preview is the only door in.
        isActive: false,
    });
}

/* ---------------------------------------------------------------------- main */

async function seedDemo() {
    const admin = await ensureDemoAdmin();
    console.log(`Demo admin ready: ${admin._id}`);

    await wipeDemoData(admin._id);
    console.log('Cleared previous demo data (scoped to the demo admin only)');

    const institute = await ensureInstitute(admin);
    const batches = await seedBatches(admin._id);
    const students = await seedStudents(admin._id, batches);

    const studentsByBatch = new Map();
    students.forEach((s) => {
        const key = String(s.batchId);
        if (!studentsByBatch.has(key)) studentsByBatch.set(key, []);
        studentsByBatch.get(key).push(s);
    });

    const [classLogs, tests, teachers, reminders, pending] = await Promise.all([
        seedClassLogs(admin._id, batches, studentsByBatch),
        seedTests(admin._id, batches, studentsByBatch),
        seedTeachers(admin._id, batches),
        seedReminders(admin._id, batches),
        seedPendingStudents(admin._id),
    ]);
    await seedDemoParent(admin._id, students[0]);

    // Stamp the build time last, so a run that dies half way is not mistaken
    // for a fresh tenant and gets retried instead.
    admin.demoSeededAt = new Date();
    await admin.save();

    const sessions = classLogs.reduce((n, log) => n + log.classes.length, 0);

    console.log('');
    console.log(`  Institute        ${institute.name}`);
    console.log(`  Batches          ${batches.length}`);
    console.log(`  Students         ${students.length}`);
    console.log(`  Class logs       ${classLogs.length} docs / ${sessions} sessions`);
    console.log(`  Tests            ${tests.length}`);
    console.log(`  Teachers         ${teachers.length}`);
    console.log(`  Reminders        ${reminders.length}`);
    console.log(`  Pending approvals ${pending.length}`);
    console.log(`  Demo parent      1 (${students[0].name})`);
    console.log('');
    console.log('Demo tenant seeded.');
}

if (require.main === module) {
    connectDb()
        .then(seedDemo)
        .then(() => mongoose.connection.close())
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('Seeding failed:', err.message);
            mongoose.connection.close().finally(() => process.exit(1));
        });
}

module.exports = { seedDemo, DEMO_EMAIL, DEMO_INSTITUTE };
