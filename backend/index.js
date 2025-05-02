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
        return res.status(200).json(response.data);
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
app.post("/add-new-batch", async (req, res) => {
    const { name } = req.body;
    const normalized = name.replace(/\s+/g, "").toLowerCase();

    try {
        // const {value} = await normalizeName(name);
        const response = new Batch({
            ...req.body,
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

//QUERIES
app.get("/get-all-students-of-batch/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const selectedBatch = await Batch.findById(id);
        const studentIdListInBatch = selectedBatch.enrolledStudents;

        const studentsData = [];

        for (const studentId of studentIdListInBatch) {
            const std = await Student.findById(studentId);
            if (std) studentsData.push(std);
        }

        return res.status(200).json(studentsData);
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
app.post("/add-attendance/:id", async (req, res) => {
    const { subject, batch, present, date } = req.body;
    const studentId = req.params.id;

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check for duplicate attendance entry
        const alreadyMarked = student.attendance.some((entry) =>
            entry.subject === subject &&
            entry.batch === batch &&
            new Date(entry.date).toDateString() === new Date(date).toDateString()
        );

        if (alreadyMarked) {
            return res.status(409).json({ message: "Attendance already marked for this date" });
        }

        // If not marked, push attendance
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
                $push: {
                    attendance: { subject, batch, present, date }
                }
            },
            { new: true }
        );

        res.status(200).json({ message: "Attendance added successfully", student: updatedStudent });

    } catch (error) {
        console.error("Error adding attendance:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
app.put('/update-batch-with-student/:id', async (req, res) => {
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





const port = process.env.PORT || 8000;
app.listen(port)

module.exports = app;


