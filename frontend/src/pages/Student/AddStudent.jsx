import { useState } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import {AiOutlineClose} from "react-icons/ai";

const AddStudent = ({ batchName, batchId, onStudentAdded, setAddedShow }) => {
    const [newStudent, setNewStudent] = useState({
        name: "",
        grade: "",
        school_name: "",
        contact_info: {
            emailIds: { student: "" },
            phoneNumbers: { student: "", mom: "", dad: "" },
        },
        fee_status: { amount: "" },
    });

    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!newStudent.name) errors.name = "Student name is required";
        if (!newStudent.grade) errors.grade = "Grade is required";
        if (!newStudent.school_name) errors.school_name = "School name is required";
        if (!newStudent.contact_info.emailIds.student) errors.student_email = "Student email is required";
        if (!newStudent.contact_info.phoneNumbers.student) errors.student_phone = "Student phone is required";
        if (!newStudent.contact_info.phoneNumbers.dad) errors.father_phone = "Father phone is required";
        if (!newStudent.contact_info.phoneNumbers.mom) errors.mother_phone = "Mother phone is required";
        if (!newStudent.fee_status.amount) errors.fee_amount = "Fee amount is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const addStudent = async () => {
        if (!validateForm()) return;

        try {
            const studentData = { ...newStudent };
            const response = await axiosInstance.post(`/add-new-student`, studentData);
            console.log(response.data)
            const newStudentId = response.data.student._id;

            // Now update the batch by adding this student ID
            const response1 = await axiosInstance.put(`/update-batch-with-student/${batchId}`, {
                enrolledStudents: newStudentId
            });

            console.log(response1)
            // Reset form and trigger refresh
            setNewStudent({
                name: "",
                grade: "",
                school_name: "",
                contact_info: {
                    emailIds: { student: "" },
                    phoneNumbers: { student: "", mom: "", dad: "" },
                },
                fee_status: { amount: "" },
            });
            setFormErrors({});
            onStudentAdded();
        } catch (err) {
            console.error("Error adding student:", err);
            alert("Failed to add student.");
        }
    };


    const handleChange = (key, value) => {
        setNewStudent(prev => {
            const updated = { ...prev };
            if (key === "name" || key === "grade" || key === "school_name") {
                updated[key] = value;
            } else if (key === "student_email") {
                updated.contact_info.emailIds.student = value;
            } else if (key === "student_phone") {
                updated.contact_info.phoneNumbers.student = value;
            } else if (key === "father_phone") {
                updated.contact_info.phoneNumbers.dad = value;
            } else if (key === "mother_phone") {
                updated.contact_info.phoneNumbers.mom = value;
            } else if (key === "fee_amount") {
                updated.fee_status.amount = value;
            }
            return updated;
        });
    };

    return (
        <div className="relative w-full border p-4 rounded-xl mt-10 overflow-y-auto space-y-4">
            {/* Close Button */}
            <div className="flex flex-col w-full overflow-hidden sticky top-0 backdrop-blur-md bg-white/80 border-b-2 p-2">
                <button
                    onClick={() => setAddedShow(false)} // assumes this hides the form
                    className="absolute top-2 right-2 text-xl text-gray-600 hover:text-red-500 transition z-10"
                >
                    <AiOutlineClose/>
                </button>

                <h2 className="text-lg font-semibold ">
                    Add New Student
                </h2>
            </div>


            {[
                {label: "Student Name", key: "name", value: newStudent.name},
                {label: "Grade", key: "grade", value: newStudent.grade},
                {label: "School Name", key: "school_name", value: newStudent.school_name},
                {label: "Student Email", key: "student_email", value: newStudent.contact_info.emailIds.student},
                {label: "Student Phone", key: "student_phone", value: newStudent.contact_info.phoneNumbers.student},
                {label: "Father Phone", key: "father_phone", value: newStudent.contact_info.phoneNumbers.dad},
                {label: "Mother Phone", key: "mother_phone", value: newStudent.contact_info.phoneNumbers.mom},
                {label: "Fee Amount", key: "fee_amount", value: newStudent.fee_status.amount}
            ].map(({label, key, value}) => (
                <div key={key} className="flex flex-col">
                    <input
                        type={
                            key.includes("email")
                                ? "email"
                                : key.includes("amount") || key === "grade"
                                    ? "number"
                                    : "text"
                        }
                        placeholder={label}
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="add-student-inputbar"
                    />
                    {formErrors[key] && (
                        <p className="text-red-500 text-sm">{formErrors[key]}</p>
                    )}
                </div>
            ))}

            <button className="border-2 rounded-lg p-2" onClick={addStudent}>
                Add Student
            </button>
        </div>);
};

export default AddStudent;
