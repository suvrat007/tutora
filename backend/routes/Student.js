const express = require('express');
const router = express.Router();
const Student = require("../models/Student.js");
const Batch = require("../models/Batch.js");
const userAuth  =require("../middleware/userAuth.js");


router.post("/add-new-student",userAuth, async (req, res) => {
    const { contact_info, batchId } = req.body;
    const adminId = req.user._id;

    try {
        const existingStudent = await Student.findOne({
            adminId:adminId,
            batchId:batchId,
            $or: [
                { "contact_info.emailIds.student": contact_info.emailIds.student },
                { "contact_info.phoneNumbers.student": contact_info.phoneNumbers.student }
            ]
        });

        if (existingStudent) {
            return res.status(409).json({ message: "Student with same email or phone already exists" });
        }

        const newStudent = new Student({
            adminId:adminId,
            batchId:batchId,
            ...req.body
        });
        await newStudent.save();

        return res.status(201).json({
            message: "Student added and enrolled successfully",
            student: newStudent,
            newStudent
        });

    } catch (error) {
        console.error("Error adding student:", error);
        return res.status(500).json({ message: "Failed to add student", error: error.message });
    }
});

router.get("/get-all-students-of-institute", userAuth, async (req, res) => {
    try {
        const adminId = req.user._id;
        const students = await Student.find({ adminId }).populate('batchId');
        return res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ message: "Failed to fetch students", error: error.message });
    }
});


router.delete("/delete-student/:id",userAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user._id;
        const response = await Student.deleteOne({ adminId ,_id: id });
        console.log(response);
        return res.status(200).json(response.data);
    }catch(error){
        console.error("Error deleting student:", error.message);
    }
})

router.patch("/update-student/:id", userAuth,async (req, res) => {
    const { id } = req.params;
    const adminId = req.user._id;

    try {
        const updated = await Student.findByIdAndUpdate({id, adminId}, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: `${name} not found` });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: `Error updating ${name}`, error: error.message });
    }
});

module.exports=router