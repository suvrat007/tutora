const express = require('express');
const router = express.Router();
const Reminder = require('../models/ReminderSchema');
const userAuth = require('../middleware/userAuth');


router.post('/add-reminder', userAuth, async (req, res) => {
    try {
        const { batchName, subjectName, reminderDate, reminder } = req.body;
        const adminId = req.user._id;

        const newReminder = new Reminder({
            adminId,
            batchName,
            subjectName,
            reminderDate: new Date(reminderDate),
            reminder
        });

        await newReminder.save();
        return res.status(201).json({ message: "Reminder added", reminder: newReminder });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add reminder" });
    }
});


router.delete('/delete-reminder/:id', userAuth, async (req, res) => {
    try {
        const deleted = await Reminder.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Reminder deleted", reminder: deleted });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete reminder" });
    }
});


router.get('/get-reminder', userAuth, async (req, res) => {
    try {
        const reminders = await Reminder.find({ adminId: req.user._id });
        return res.status(200).json({ message: "Fetched", reminder: reminders });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch reminders" });
    }
});

module.exports = router;
