const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const {signupValidation,logInValidation} = require('../utils/validations');
const userAuth = require("../middleware/userAuth");
const Institute = require("../models/Institutes");


router.post("/signup", async (req, res) => {
    const { error } = signupValidation.validate(req.body.admin);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, emailId, password } = req.body.admin;

    try {
        const existingUser = await Admin.findOne({ emailId });
        if (existingUser) return res.status(403).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new Admin({ name, emailId, password: hashedPassword });
        await newUser.save();

        const newInstitute = new Institute({
            adminId: newUser._id,
            name: req.body.name,
            logo_URL: req.body.logo_URL,
            contact_info: {
                emailId: req.body.emailId,
                phone_number: req.body.phone_number,
            },
        });

        await newInstitute.save();

        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_KEY, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 3600000 * 24,
        });

        const userObject = newUser.toObject();
        delete userObject.password;

        res.status(201).json({ message: "User created", user: userObject });
    } catch (err) {
        console.error("Signup Error:", err);
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

        const token =jwt.sign({_id:user._id},process.env.JWT_KEY,{expiresIn: '1d'});
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path:'/',
            maxAge:3600000*24
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
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // ✅ if you're on localhost — set to true only in production (HTTPS)
    });
    res.status(200).json({ message: "Logged out successfully" });
});


module.exports = router