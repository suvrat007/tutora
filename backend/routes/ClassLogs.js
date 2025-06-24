const express = require('express');
const router = express.Router();
const ClassLog = require("../models/ClassLogSchema.js");
const Batch = require("../models/Batch.js");
const userAuth  =require("../middleware/userAuth.js");


router.post('/add-class-update',userAuth, async (req, res) => {
    try {
        const { batchName, subject_id, date, hasHeld, note } = req.body;
        const normalizedBatchName = batchName.replace(/\s+/g, "").toLowerCase();

        const batch = await Batch.findOne({ normalized_name: normalizedBatchName });

        if (!batch) {
            return res.status(404).json({ message: "Invalid batch name" });
        }

        let classLog = await ClassLog.findOne({ batch_id: batch._id });

        if (!classLog) {
            classLog = new ClassLog({
                batch_id: batch._id,
                classes: [{
                    subject_id,
                    date:date.split('T')[0],
                    hasHeld,
                    note
                }]
            });
            await classLog.save();
        } else {
            await ClassLog.findOneAndUpdate(
                { batch_id: batch._id },
                {
                    $push: {
                        classes: {
                            subject_id,
                            date,
                            hasHeld,
                            note
                        }
                    }
                }
            );
        }

        const populatedLog = await ClassLog.findOne({ batch_id: batch._id }).populate('batch_id');

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
router.get('/check-class-in-log/:id', userAuth,async (req, res) => {
    try {
        const batch_id = req.params.id;
        const { subject_id, date } = req.query; // ✅ Use query params in GET

        const dateString = date.split('T')[0]; // Normalize date

        const logExists = await ClassLog.findOne({
            batch_id,
            classes: {
                $elemMatch: {
                    subject_id,
                    date: dateString
                }
            }
        });

        if (logExists) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.log("Check class log error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports=router