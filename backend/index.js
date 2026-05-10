require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const {connectDb}=require("./utils/databaseConnection")
const cors = require('cors');
const cookieParser=require('cookie-parser')
const StudentRouter = require("./routes/Student.js");
const BatchRouter = require("./routes/Batch.js");
const ReminderRouter = require("./routes/Reminders.js");
const ClassLogRouter = require("./routes/ClassLogs.js");
const AdminRouter = require("./routes/Admin.js");
const AuthRouter = require("./routes/Auth.js");
const InstituteRouter = require("./routes/Institute.js");
const TestRouter = require("./routes/Test.js");
const TeacherRouter = require("./routes/Teacher.js");
const RegistrationRouter = require("./routes/Registration.js");
const ParentRouter = require("./routes/Parent.js");
const SubscriptionRouter = require("./routes/Subscription.js");
const WebhookRouter = require("./routes/Webhook.js");

app.use(cors({
    origin:['http://localhost:5173','https://tutor-a.vercel.app'],
    credentials: true,
}))

// Raw body parser for Razorpay webhook MUST come before express.json()
app.use('/api/webhooks/razorpay', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cookieParser())

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts, please try again later.' },
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/v1/auth', authLimiter);
app.use('/api', apiLimiter);

app.use('/api/v1/student', StudentRouter);
app.use('/api/v1/batch', BatchRouter);
app.use('/api/v1/reminder', ReminderRouter);
app.use('/api/v1/classLog', ClassLogRouter);
app.use('/api/v1/admin', AdminRouter);
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/institute', InstituteRouter);
app.use('/api/v1/test', TestRouter);
app.use('/api/v1/teacher', TeacherRouter);
app.use('/api/v1/register', RegistrationRouter);
app.use('/api/v1/parent', ParentRouter);
app.use('/api/v1/subscription', SubscriptionRouter);
app.use('/api/webhooks', WebhookRouter);
app.get('/', (req, res) => {
    res.send('Welcome to the Tutor-A API');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
});

connectDb().then(()=>{
    console.log("connected to database")
    if(require.main === module){
        app.listen(8000,()=>console.log("Server is running on port 8000"))
    }
}).catch((err)=>{
    console.log("Error while connecting to database:", err.message)
})

module.exports = app;
