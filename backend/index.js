const express = require('express');
const app = express();
const {connectDb}=require("./utils/databaseConnection")
const cors = require('cors');
const cookieParser=require('cookie-parser')
const StudentRouter = require("./routes/Student.js");
const BatchRouter = require("./routes/Batch.js");
const ReminderRouter = require("./routes/Reminders.js");
const ClassLogRouter  =require("./routes/ClassLogs.js");
const AdminRouter  =require("./routes/Admin.js");
const AuthRouter = require("./routes/Auth.js");
const InstituteRouter = require("./routes/Institute.js");

app.use(cors({
    // origin:['http://localhost:5173'],
    origin:['    origin:[\'http://localhost:5173\'],\n'],
    credentials: true,
}))

app.use(express.json());
app.use(cookieParser())
require('dotenv').config();

app.use('/api/student', StudentRouter);
app.use('/api/batch', BatchRouter);
app.use('/api/reminder',ReminderRouter);
app.use('/api/classLog', ClassLogRouter);
app.use('/api/admin', AdminRouter);
app.use('/api/auth', AuthRouter)
app.use('/api/institute',InstituteRouter)


connectDb().then(()=>{
    console.log("connected to database")
    app.listen(8000,()=>console.log("Server is running on port 8000"))
}).catch(()=>{
    console.log("Error while connecting to database")
})

