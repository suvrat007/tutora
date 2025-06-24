const express = require('express');
const router = express.Router();
const userAuth  =require("../middleware/userAuth.js");
const Batch = require("../models/Batch.js");

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
        const response = await Batch.find({adminId:adminId}).populate('enrolledStudents admin');
        console.log(response);
        return res.status(200).json(response);

    }catch(error){
        console.error("Error fetching Batch:", error);
        return res.status(500).json({ message: "Failed to fetch Batches", error: error.message });
    }
})
router.delete("/delete-batch/:id",userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Batch.deleteOne({ _id: id });
        console.log(response);
        return res.status(200).json(response);
    }catch(error){
        console.error("Error deleting batch:", error.message);
    }
})
router.put("/update-batch/:id", userAuth,async (req, res) => {
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

router.put('/update-batch-with-student/:id', userAuth,async (req, res) => {
    try {
        const { newStudentId } = req.body;
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { enrolledStudents: newStudentId } }, // avoids duplicates
            { new: true }
        );
        res.status(200).json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports=router