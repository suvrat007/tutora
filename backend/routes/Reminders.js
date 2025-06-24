const express = require('express');
const router = express.Router();
const Reminder = require ("../models/ReminderSchema.js");
const userAuth  =require("../middleware/userAuth.js");


router.post('/add-reminder', userAuth,async (req, res) => {
    try{
        const { batchName , subjectName , reminderDate, reminder} = req.body
        const response = await Reminder({
            batchName,
            subjectName,
            reminderDate,
            reminder
        })
        await response.save();
        console.log("reminder added:", response);
        return res.status(201).json({ message: "reminder added successfully", batch: response });
    }catch(error){
        console.log(error.message);
    }
})
router.delete('/delete-reminder/:id', userAuth,async (req, res) => {
    try{
        const {id} = req.params;
        const response = await Reminder.findOneAndDelete({ _id: id });
        console.log("reminder deleted", response);
        return res.status(201).json({ message: "reminder deleted successfully", batch: response });
    }catch(error){
        console.log(error.message);
    }
})
router.get('/get-reminder', userAuth,async (req, res) => {
    try{
        const response = await Reminder.find();
        console.log("reminder fetched", response);
        return res.status(201).json({ message: "reminder fetched successfully", batch: response });
    }catch(error){
        console.error(error.message);
    }
})


module.exports =router