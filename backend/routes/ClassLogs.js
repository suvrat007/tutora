const express = require('express');
const router = express.Router();
const ClassLog = require("../models/ClassLogSchema.js");
const Batch = require("../models/Batch.js");
const userAuth  =require("../middleware/userAuth.js");


router.post('/add-class-update', userAuth, async (req, res) => {
    try {
        const { batch_id, subject_id, date, hasHeld, note ,updated} = req.body;
        const adminId = req.user._id;
        const isoDate = new Date(date).toISOString().split('T')[0];

        let classLog = await ClassLog.findOne({
            adminId,
            batch_id: batch_id,
            subject_id: subject_id
        });

        if (!classLog) {
            classLog = new ClassLog({
                adminId: adminId,
                batch_id: batch_id,
                subject_id: subject_id,
                classes: [{
                    date: isoDate,
                    hasHeld,
                    note,
                    updated: false,
                    attendance: []
                }]
            });
            await classLog.save();
        } else {
            const index = classLog.classes.findIndex(
                cls => new Date(cls.date).toISOString().split('T')[0] === isoDate
            );

            if (index !== -1) {
                // If class already exists, update it
                classLog.classes[index].hasHeld = hasHeld;
                classLog.classes[index].note = note;
                classLog.classes[index].updated = updated;
                await classLog.save();
            } else {
                // Add new class entry
                classLog.classes.push({
                    date: isoDate,
                    hasHeld,
                    note,
                    updated: updated || false,
                    attendance: []
                });
                await classLog.save();
            }
        }

        const populatedLog = await ClassLog.findOne({
            adminId,
            batch_id: batch_id,
            subject_id: subject_id
        }).populate('batch_id');

        console.log("ClassLog added:", populatedLog);
        return res.status(201).json({ message: "ClassLog added successfully", batch: populatedLog });

    } catch (error) {
        console.error("Error adding class log:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.get('/get-class-by-batchId/:id',userAuth, async (req, res) => {
    const {id}=req.params.id
    try{
        const populatedLog = await ClassLog.findById({batch_id:id}).populate('batch_id');

    }catch (e){
        console.log(e.message)
    }
})


router.get('/getAllClasslogs', userAuth, async (req, res) => {
    try {
        const adminId = req.user._id;

        const response = await ClassLog.find({ adminId })
            .populate('batch_id');

        res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching class logs:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



module.exports=router