const express = require('express');
const router = express.Router();
const userAuth  =require("../middleware/userAuth.js");
const Batch = require("../models/Batch.js");
const Student = require("../models/Student.js");
const ClassLog = require("../models/ClassLogSchema.js");

router.post("/add-new-batch",userAuth, async (req, res) => {
    const { name } = req.body;
    const normalized = name.replace(/\s+/g, "").toLowerCase();
    const uid= req.adminId

    try {
        const response = new Batch({
            ...req.body,
            adminId:uid,
            normalized_name:normalized
        });
        await response.save();
        // console.log("Batch added:", response);
        return res.status(201).json({ message: "Batch added successfully", batch: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
});
router.get("/get-all-batches",userAuth, async (req, res) => {
    try{
        const adminId = req.adminId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            Batch.countDocuments({ adminId }),
            Batch.find({ adminId }).skip(skip).limit(limit)
        ]);

        return res.status(200).json({
            data,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    }catch(error){
        console.error("Error fetching Batch:", error);
        return res.status(500).json({ message: "Failed to fetch Batches", error: error.message });
    }
})

router.delete("/delete-batch/:id", userAuth, async (req, res) => {
    try {
        const batchId = req.params.id;
        const adminId = req.adminId;
        const { shouldDeleteStudents } = req.body;

        const batchDeleteResult = await Batch.deleteOne({ adminId, _id: batchId });

        // The cascades below used to run even when the batch delete matched
        // nothing, and were themselves unscoped - so any logged-in admin could
        // wipe another tenant's students by naming their batch id. Bail out
        // unless this admin really did own the batch.
        if (batchDeleteResult.deletedCount !== 1) {
            return res.status(404).json({ message: "Batch not found" });
        }

        if (shouldDeleteStudents) {
            const studentDeleteResult = await Student.deleteMany({ batchId, adminId });
            const classLogDeleteResult = await ClassLog.deleteMany({ batch_id:batchId, adminId });
            return res.status(200).json({
                message: "Batch and associated students deleted successfully",
                batchDeleteResult,
                studentDeleteResult,
                classLogDeleteResult
            });
        } else {
            const studentUpdateResult = await Student.updateMany(
                { batchId, adminId },
                { $set: { batchId: null } }
            );
            const classLogUpdateResult = await ClassLog.deleteMany({ batch_id:batchId, adminId });
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
        // Allowlist rather than spreading req.body: the old code let a caller
        // pass adminId and move somebody else's batch into their own account.
        const ALLOWED = ['name', 'forStandard', 'teacherInCharge', 'subject'];
        const updateData = {};
        ALLOWED.forEach((key) => {
            if (req.body[key] !== undefined) updateData[key] = req.body[key];
        });

        if (name) {
            updateData.normalized_name = name.replace(/\s+/g, "").toLowerCase();
        }

        // Scoped: previously findByIdAndUpdate with no adminId, so any admin
        // could edit any batch whose id they knew.
        const updated = await Batch.findOneAndUpdate(
            { _id: id, adminId: req.adminId },
            updateData,
            { new: true }
        );

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
    const adminId = req.adminId
    try {
        const response = await Batch.findOne({ adminId, _id: id }).populate('enrolledStudents admin');
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