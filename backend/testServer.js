const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Force override any middleware that sets req.user
app.use((req, res, next) => {
    req.user = { _id: '6862f05f382e7504b8ea4bce' };
    
    // Override verify temporarily since userAuth calls jwt.verify
    const jwt = require('jsonwebtoken');
    jwt.verify = () => ({ _id: '6862f05f382e7504b8ea4bce' });
    req.cookies = { token: 'mock' };
    
    next();
});

const StudentRouter = require('./routes/Student');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use('/api/student', StudentRouter);

mongoose.connect(process.env.VITE_MONGO_URI).then(() => {
    app.listen(8001, () => {
        console.log('Test server ready');
    });
});
