const mongoose = require('mongoose');


// PERCENT ENCODING FOR PASSWORD

const express = require('express');
const cors = require('cors');
const app = express();

const jwt = require('jsonwebtoken');
// const {authenticateToken} = require('./utilities');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.VITE_MONGO_URI);

app.use(express.json());

app.use(cors({
    origin: "*",    // allows requests from any origin
}));

const Student = require("./models/All_Students_Schema");
const Teacher = require("./models/All_Teachers_Schema");
const Admin = require("./models/Admin");
const Batch = require("./models/Batch");

app.get('/', (req, res) => {
    res.json({
        data:"hello"
    })
})

// STUDENT CRUD
app.post("/add-new-student", async (req, res) => {
    try {
        const { contact_info } = req.body;

        // Check for duplicate based on email or phone
        if (contact_info?.emailIds?.student || contact_info?.phoneNumbers?.student) {
            const existingStudent = await Student.findOne({
                $or: [
                    { "contact_info.emailIds.student": contact_info.emailIds.student },
                    { "contact_info.phoneNumbers.student": contact_info.phoneNumbers.student }
                ]
            });

            if (existingStudent) {
                return res.status(409).json({ message: "Student with same email or phone number already exists" });
            }
        }
        const response = new Student(req.body);
        await response.save();
        console.log("Student added:", response);
        return res.status(201).json({ message: "Student added successfully", student: response });
    } catch (error) {
        console.error("Error adding student:", error);
        return res.status(500).json({ message: "Failed to add student", error: error.message });
    }
});
app.get("/get-all-students", async (req, res) => {
    try{
        const response = await Student.find();
        console.log(response);
        return res.status(200).json(response);

    }catch(error){
        console.error("Error adding student:", error);
        return res.status(500).json({ message: "Failed to fetch students", error: error.message });
    }
})
app.delete("/delete-student/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Student.deleteOne({ _id: id });
        console.log(response);
        return res.status(200).json(response);
    }catch(error){
        console.error("Error deleting student:", error.message);
    }
})
app.put("/update-student/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Student.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: `${name} not found` });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: `Error updating ${name}`, error: error.message });
    }
});

// BATCH CRUD
const normalizeName = async (name, currentId = null) => {
    if (!name) return { success: true, value: null }; // nothing to normalize

    const normalized = name.replace(/\s+/g, "").toLowerCase();

    const existingBatch = await Batch.findOne({ normalized_name: normalized });

    if (existingBatch && existingBatch._id.toString() !== currentId) {
        return { success: false, message: "Batch with same name already exists" };
    }

    return { success: true, value: normalized };
}
app.post("/add-new-batch", async (req, res) => {
    const { name } = req.body;
    try {
        const {value} = await normalizeName(name);
        const response = new Batch({
            ...req.body,
            "normalized_name":value
        });
        await response.save();
        console.log("Batch added:", response);
        return res.status(201).json({ message: "Batch added successfully", batch: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

});
app.get("/get-all-batches", async (req, res) => {
    try{
        const response = await Batch.find();
        console.log(response);
        return res.status(200).json(response);

    }catch(error){
        console.error("Error fetching Batch:", error);
        return res.status(500).json({ message: "Failed to fetch Batches", error: error.message });
    }
})
app.delete("/delete-batch/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Batch.deleteOne({ _id: id });
        console.log(response);
        return res.status(200).json(response);
    }catch(error){
        console.error("Error deleting batch:", error.message);
    }
})
app.put("/update-batch/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        // Normalize and check name
        const normalizedName = await normalizeName(name, id); // pass id to ignore current batch

        if (!normalizedName.success) {
            return res.status(409).json({ message: normalizedName.message });
        }

        // Update with normalized_name added
        const updated = await Batch.findByIdAndUpdate(id, {
            ...req.body,
            normalized_name: normalizedName.value
        }, { new: true });

        if (!updated) return res.status(404).json({ message: `${name} not found` });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: `Error updating ${name}`, error: error.message });
    }
});




const port = process.env.PORT || 8000;
app.listen(port)

module.exports = app;


