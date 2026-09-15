const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const {signupValidation,logInValidation} = require('../utils/validations');
const Institute = require("../models/Institutes");
const userAuth = require("../middleware/userAuth");
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { SESSION_MINUTES, SESSION_MS, isEnabled, getDemoAdminId } = require('../config/demo');

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 3600000 * 24 * 7,
};

// Its own budget, deliberately not shared with authLimiter: a scripted
// guest-login loop must not be able to lock real users on the same NAT out of
// the login page.
const guestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many demo sessions from this network. Please try again later.' },
});

/**
 * Hands out a 10-minute read-only pass to the seeded demo tenant.
 *
 * Two cookies are minted: the admin `token` for the dashboard, and a
 * `parentToken` for the parent-portal preview, both expiring together. The
 * JWT's own `exp` is the enforcement mechanism - the countdown in the UI is
 * only cosmetic, so a guest who freezes their clock still gets cut off on time.
 */
router.post('/guest', guestLimiter, async (req, res) => {
    try {
        if (!isEnabled()) return res.status(404).json({ message: 'Not found' });

        const demoAdminId = await getDemoAdminId();
        if (!demoAdminId) {
            return res.status(503).json({ message: 'The demo is being set up. Please try again shortly.' });
        }

        const admin = await Admin.findById(demoAdminId).select('-password').populate('institute_info');
        if (!admin || !admin.institute_info) {
            return res.status(503).json({ message: 'The demo is being refreshed. Please try again shortly.' });
        }

        const ttlSeconds = SESSION_MINUTES * 60;
        const sessionId = crypto.randomUUID();

        // The parent-portal preview rides along on the same session. The demo
        // ParentAuth row is isActive:false, so /parent/login can never hand this
        // out - minting it here is the only way in.
        const ParentAuth = require('../models/ParentAuth');
        const demoParent = await ParentAuth.findOne({ adminId: admin._id }).select('_id studentId').lean();

        const token = jwt.sign(
            {
                _id: admin._id,
                instituteId: admin.institute_info._id,
                guest: true,
                sid: sessionId,
                // Carried in the token so a refreshed page still knows the
                // parent preview is available, without another DB round-trip.
                pp: Boolean(demoParent),
            },
            process.env.JWT_KEY,
            { expiresIn: ttlSeconds }
        );

        const guestCookie = { ...cookieOptions, maxAge: SESSION_MS };
        res.cookie('token', token, guestCookie);

        if (demoParent) {
            const parentToken = jwt.sign(
                {
                    parentId: demoParent._id,
                    studentId: demoParent.studentId,
                    adminId: admin._id,
                    role: 'parent',
                    guest: true,
                    sid: sessionId,
                },
                process.env.JWT_KEY,
                { expiresIn: ttlSeconds }
            );
            res.cookie('parentToken', parentToken, guestCookie);
        }

        const now = Date.now();
        res.status(200).json({
            message: 'Guest session started',
            user: admin,
            guest: {
                isGuest: true,
                sessionId,
                expiresAt: new Date(now + SESSION_MS).toISOString(),
                // Lets the client correct for a wrong device clock instead of
                // trusting its own Date.now() against a server timestamp.
                serverNow: new Date(now).toISOString(),
                hasParentPreview: Boolean(demoParent),
            },
        });
    } catch (err) {
        console.error('guest login error:', err);
        res.status(500).json({ message: 'Could not start the demo session' });
    }
});

router.post('/google-auth',async (req, res) => {
    try {
        const { access_token } = req.body;

        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        if (!googleRes.ok) return res.status(401).json({ message: 'Invalid Google token' });

        const { email, given_name, picture } = await googleRes.json();

        // Check if user exists or create new one
        let user = await Admin.findOne({ emailId: email });
        // The demo account uses a .invalid address Google can never issue a
        // token for, but check anyway in case the demo email ever changes.
        if (user?.isDemo) return res.status(403).json({ message: 'Invalid Google token' });
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

        res.cookie("token", token, cookieOptions)

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

        res.cookie("token", token, cookieOptions)

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

        // The demo tenant is reachable only through POST /auth/guest. Same
        // message as a bad password so this isn't an account-enumeration oracle.
        if (user.isDemo) {
            return res.status(403).json({ message: 'Invalid Credentials '});
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(403).json({ message: 'Invalid Credentials '});
        }

        const token = jwt.sign({ _id: user._id, instituteId: user.institute_info || null }, process.env.JWT_KEY, { expiresIn: '7d' });
        res.cookie("token", token, cookieOptions)

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
    // clearCookie must be given the same attributes the cookie was set with, or
    // a production SameSite=None; Secure cookie is not removed at all - which
    // would leave an "ended" demo session still holding a valid cookie.
    const { maxAge, ...clearOptions } = cookieOptions;
    res.clearCookie("token", clearOptions);

    // A guest session owns both cookies, so ending it must clear both. A normal
    // tutor logout must not: a parent may be signed in on the same browser, and
    // their session is deliberately independent of the admin one.
    let wasGuest = false;
    try {
        wasGuest = jwt.verify(req.cookies?.token || '', process.env.JWT_KEY)?.guest === true;
    } catch {
        wasGuest = false;
    }
    if (wasGuest) res.clearCookie("parentToken", clearOptions);

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

        const token = jwt.sign({ _id: admin._id, instituteId: newInstitute._id }, process.env.JWT_KEY, { expiresIn: '7d' });
        res.cookie("token", token, cookieOptions);

        res.status(201).json({ message: 'Onboarding complete', user: userObj });
    } catch (err) {
        console.error('complete-onboarding error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router