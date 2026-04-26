const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const {signupValidation,logInValidation} = require('../utils/validations');
const Institute = require("../models/Institutes");
const {OAuth2Client} = require("google-auth-library");
const userAuth = require("../middleware/userAuth");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-auth',async (req, res) => {
    try {
        const { credential } = req.body; // Google ID token from frontend

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, given_name, picture } = payload;

        // Check if user exists or create new one
        let user = await Admin.findOne({ emailId: email });
        let isNewUser = false;

        if (!user) {
            user = new Admin({
                name: given_name,
                emailId: email,
                adminPicURL: picture,
                isGoogleAuth: true,
            });
            await user.save();
            isNewUser = true;
        }

        // Token embeds adminId + instituteId so middleware skips a DB round-trip per request.
        // Refresh strategy: reissue on /api/auth/login or /api/auth/google-auth; no silent refresh yet.
        const token = jwt.sign({ _id: user._id, instituteId: user.institute_info || null }, process.env.JWT_KEY, { expiresIn: '7d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 3600000 * 24 * 7,
        })

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            message: 'Google authentication successful',
            user: userObj,
            isNewUser,
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ message: 'Invalid Google token' });
    }
});

router.post("/signup", async (req, res) => {
    const { error } = signupValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    if (!req.body || !req.body.name || !req.body.emailId || !req.body.password) {
        return res.status(400).json({ message: "Incomplete admin credentials" });
    }

    const { name, emailId, password } = req.body;

    try {
        const existingUser = await Admin.findOne({ emailId });
        if (existingUser) return res.status(403).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new Admin({ name, emailId, password: hashedPassword });
        await newUser.save();

        const newInstitute = new Institute({
            adminId: newUser._id,
            name: req.body.institute_info.instiName,
            logo_URL: req.body.institute_info.logo_URL,
            contact_info: {
                emailId: req.body.institute_info.instituteEmailId,
                phone_number: req.body.institute_info.phone_number,
            },
        });

        await newInstitute.save();

        newUser.institute_info = newInstitute._id;
        await newUser.save();

        const token = jwt.sign({ _id: newUser._id, instituteId: newInstitute._id }, process.env.JWT_KEY, { expiresIn: '7d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 3600000 * 24 * 7,
        })

        const userObject = newUser.toObject();
        delete userObject.password;

        res.status(201).json({ message: "User created", user: userObject });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});


router.post("/login", async (req, res) => {
    const {error} = logInValidation.validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const { emailId, password } = req.body;
    try{
        const user = await Admin.findOne({emailId:emailId});
        if (!user) {
            return res.status(403).json({ message: 'Invalid Credentials '});
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(403).json({ message: 'Invalid Credentials '});
        }

        const token = jwt.sign({ _id: user._id, instituteId: user.institute_info || null }, process.env.JWT_KEY, { expiresIn: '7d' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 3600000 * 24 * 7,
        })

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({message: 'User logged in successfully',user:userObj})
    }
    catch (err) {
        console.error("Signup Error:", err);
        return res.status(500).json({ message: 'Internal server error' });
    }
})

router.post("/logout", async (req, res) => {
    res.cookie("token",null,{
        expires:new Date(Date.now())
    })
    res.status(200).json({ message: "Logged out successfully" });
});


// Called after Google OAuth for new users who haven't set up an institute yet
router.post('/complete-onboarding', userAuth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        if (admin.institute_info) {
            return res.status(400).json({ message: 'Institute already exists' });
        }

        const { instiName, logo_URL, instituteEmailId, phone_number } = req.body;

        const newInstitute = new Institute({
            adminId: admin._id,
            name: instiName,
            logo_URL: logo_URL || '',
            contact_info: {
                emailId: instituteEmailId,
                phone_number,
            },
        });

        await newInstitute.save();
        admin.institute_info = newInstitute._id;
        await admin.save();

        const updatedAdmin = await Admin.findById(admin._id).populate('institute_info');
        const userObj = updatedAdmin.toObject();
        delete userObj.password;

        res.status(201).json({ message: 'Onboarding complete', user: userObj });
    } catch (err) {
        console.error('complete-onboarding error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router