const express = require('express');
const router = express.Router();
const userAuth  =require("../middleware/userAuth.js");
const Batch = require("../models/Batch.js");
const Student = require("../models/Student.js");
const ClassLog = require("../models/ClassLogSchema.js");

router.post("/add-new-batch",userAuth, async (req, res) => {
    const { name } = req.body;
    const normalized = name.replace(/\s+/g, "").toLowerCase();
    const uid= req.user._id

    try {
        const response = new Batch({
            ...req.body,
            adminId:uid,
            normalized_name:normalized
        });
        await response.save();
        console.log("Batch added:", response);
        return res.status(201).json({ message: "Batch added successfully", batch: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
});
router.get("/get-all-batches",userAuth, async (req, res) => {
    try{
        const adminId = req.user._id
        const response = await Batch.find({adminId:adminId});
        console.log(response);
        return res.status(200).json(response);

    }catch(error){
        console.error("Error fetching Batch:", error);
        return res.status(500).json({ message: "Failed to fetch Batches", error: error.message });
    }
})

router.delete("/delete-batch/:id", userAuth, async (req, res) => {
    try {
        const batchId = req.params.id;
        const adminId = req.user._id;
        const { shouldDeleteStudents } = req.body;

        const batchDeleteResult = await Batch.deleteOne({ adminId, _id: batchId });

        if (shouldDeleteStudents) {
            const studentDeleteResult = await Student.deleteMany({ batchId });
            const classLogDeleteResult = await ClassLog.deleteMany({ batchId });
            return res.status(200).json({
                message: "Batch and associated students deleted successfully",
                batchDeleteResult,
                studentDeleteResult,
                classLogDeleteResult
            });
        } else {
            const studentUpdateResult = await Student.updateMany(
                { batchId },
                { $set: { batchId: null } }
            );
            const classLogUpdateResult = await ClassLog.deleteMany({ batchId });
            return res.status(200).json({
                message: "Batch deleted and students disassociated",
                batchDeleteResult,
                studentUpdateResult,
                classLogUpdateResult
            });
        }
    } catch (error) {
        console.error("Error deleting batch:", error.message);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


router.patch("/update-batch/:id", userAuth,async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updateData = { ...req.body };

        if (name) {
            updateData.normalized_name = name.replace(/\s+/g, "").toLowerCase();
        }

        const updated = await Batch.findByIdAndUpdate(id, updateData, { new: true });

        if (!updated) {
            return res.status(404).json({ message: `${name || "Batch"} not found` });
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: `Error updating ${name}, error: error.message `});
    }
});


router.get("/get-batch/:id", userAuth,async (req, res) => {
    const id = req.params.id;
    const adminId = req.user._id
    try {
        const response = await Batch.findById({adminId:adminId , _id:id}).populate('enrolledStudents admin');
        if (!response) {
            return res.status(404).json({ message: "Batch not found" });
        }
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching batch:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports=router