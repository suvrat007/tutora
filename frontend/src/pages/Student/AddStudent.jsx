import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { AiOutlineClose } from "react-icons/ai";
import { motion } from "framer-motion";
import useFetchStudents from "@/pages/useFetchStudents.js";
import useFetchBatches from "@/pages/useFetchBatches.js";
import { useSelector } from "react-redux";

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const placeholderVariants = {
    pulse: {
        scale: [1, 1.1, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
};

const AddStudent = ({
                        setEdit,
                        onStudentAdded,
                        setSeeStdDetails,
                        setShowAddStd,
                        existingStudentData = null,
                        isEditMode = false,
                    }) => {
    const batches = useSelector((state) => state.batches);
    const [selectedBatchId, setSelectedBatchId] = useState(existingStudentData?.batchId || "");
    const [newStudent, setNewStudent] = useState({
        batchId: null,
        subjectId: [],
        name: "",
        address: "",
        grade: "",
        school_name: "",
        contact_info: {
            emailIds: { student: "", mom: "", dad: "" },
            phoneNumbers: { student: "", mom: "", dad: "" },
        },
        fee_status: {
            amount: "",
            feeStatus: [{ date: new Date(), paid: false }],
        },
    });
    const [formErrors, setFormErrors] = useState({});
    const fetchStudents = useFetchStudents();
    const fetchBatches = useFetchBatches();

    useEffect(() => {
        if (isEditMode && existingStudentData) {
            setNewStudent({
                ...existingStudentData,
                grade: String(existingStudentData.grade || ""), // Ensure grade is a string
                fee_status: {
                    amount: String(existingStudentData.fee_status?.amount || ""), // Ensure amount is a string
                    feeStatus: existingStudentData.fee_status?.feeStatus?.length > 0
                        ? existingStudentData.fee_status.feeStatus
                        : [{ date: new Date(existingStudentData.admission_date), paid: false }],
                },
            });
            setSelectedBatchId(existingStudentData.batchId || "");
        }
    }, [isEditMode, existingStudentData]);

    const validateForm = () => {
        const errors = {};

        // Required field validations
        if (!newStudent.name.trim()) errors.name = "Please fill in the student name";
        if (!newStudent.grade || String(newStudent.grade).trim() === "") errors.grade = "Please fill in the grade";
        if (!newStudent.address.trim()) errors.address = "Please fill in the address";
        if (!newStudent.school_name.trim()) errors.school_name = "Please fill in the school name";
        if (!newStudent.contact_info.emailIds.student.trim()) errors.student_email = "Please fill in the student email";
        if (!newStudent.contact_info.phoneNumbers.student.trim()) errors.student_phone = "Please fill in the student phone";
        if (!newStudent.contact_info.emailIds.dad.trim()) errors.dad_email = "Please fill in the father email";
        if (!newStudent.contact_info.phoneNumbers.dad.trim()) errors.dad_phone = "Please fill in the father phone";
        if (!newStudent.contact_info.emailIds.mom.trim()) errors.mom_email = "Please fill in the mother email";
        if (!newStudent.contact_info.phoneNumbers.mom.trim()) errors.mom_phone = "Please fill in the mother phone";
        if (!newStudent.fee_status.amount || String(newStudent.fee_status.amount).trim() === "") errors.fee_amount = "Please fill in the fee amount";

        // Batch and subject validation (only if a batch is selected)
        if (selectedBatchId) {
            const selectedBatch = batches.find((b) => b._id === selectedBatchId);
            if (selectedBatch && String(selectedBatch.forStandard) !== String(newStudent.grade)) {
                errors.batchGradeMismatch = `Selected batch is for Class ${selectedBatch.forStandard}, but student is in Class ${newStudent.grade}.`;
            }
            if (!newStudent.subjectId.length) {
                errors.subjectId = "Please select at least one subject for the selected batch.";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const studentData = {
                ...newStudent,
                batchId: selectedBatchId || null,
            };

            if (isEditMode && existingStudentData?._id) {
                await axiosInstance.patch(`/api/student/update-student/${existingStudentData._id}`, studentData, {
                    withCredentials: true,
                });
                fetchStudents();
                fetchBatches();
            } else {
                await axiosInstance.post("/api/student/add-new-student", studentData, { withCredentials: true });
                fetchStudents();
                fetchBatches();
            }

            onStudentAdded();
            setSeeStdDetails((prev) => ({ ...prev, show: false }));
            isEditMode ? setEdit(false) : setShowAddStd(false);
        } catch (err) {
            console.error("Error submitting student data:", err);
            alert("Failed to submit student data.");
        }
    };

    const handleChange = (key, value) => {
        if (key.includes("email") || key.includes("phone")) {
            const [type, field] = key.split("_");
            setNewStudent((prev) => ({
                ...prev,
                contact_info: {
                    ...prev.contact_info,
                    [type === "email" ? "emailIds" : "phoneNumbers"]: {
                        ...prev.contact_info[type === "email" ? "emailIds" : "phoneNumbers"],
                        [field]: value,
                    },
                },
            }));
        } else if (key === "fee_amount") {
            setNewStudent((prev) => ({
                ...prev,
                fee_status: {
                    ...prev.fee_status,
                    amount: value,
                },
            }));
        } else {
            setNewStudent((prev) => ({
                ...prev,
                [key]: value,
            }));
        }
    };

    const eligibleBatches = batches.filter((batch) => String(batch?.forStandard) === String(newStudent?.grade));

    return (
        <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
        >
            <div className="relative w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[50em] bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#e6c8a8]">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#5a4a3c]">
                        {isEditMode ? "Edit Student" : "Add New Student"}
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.1, color: "#FF3B30" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => (isEditMode ? setEdit(false) : setShowAddStd(false))}
                        className="text-[#e0c4a8] hover:text-[#FF3B30] transition"
                    >
                        <AiOutlineClose className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>
                </div>

                <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 max-h-[80vh] overflow-y-auto">
                    {isEditMode && (
                        <div className="flex items-center justify-center p-3 sm:p-4">
                            <motion.img
                                src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                                alt="Student Avatar"
                                className="w-24 sm:w-32 md:w-40 rounded-full border border-[#e6c8a8]"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    )}

                    {[
                        {
                            title: "General Info",
                            fields: [
                                { label: "Student Name", key: "name", type: "text", value: newStudent.name },
                                { label: "Grade", key: "grade", type: "number", value: newStudent.grade },
                                { label: "School Name", key: "school_name", type: "text", value: newStudent.school_name },
                                { label: "Address", key: "address", type: "text", value: newStudent.address },
                            ],
                        },
                        {
                            title: "Student's Contact",
                            fields: [
                                { label: "Student Email", key: "email_student", type: "email", value: newStudent.contact_info.emailIds.student },
                                { label: "Student Phone", key: "phone_student", type: "text", value: newStudent.contact_info.phoneNumbers.student },
                            ],
                        },
                        {
                            title: "Parent's Contact",
                            fields: [
                                { label: "Father Email", key: "email_dad", type: "email", value: newStudent.contact_info.emailIds.dad },
                                { label: "Father Phone", key: "phone_dad", type: "text", value: newStudent.contact_info.phoneNumbers.dad },
                                { label: "Mother Email", key: "email_mom", type: "email", value: newStudent.contact_info.emailIds.mom },
                                { label: "Mother Phone", key: "phone_mom", type: "text", value: newStudent.contact_info.phoneNumbers.mom },
                            ],
                        },
                        {
                            title: "Fee Details",
                            fields: [{ label: "Fee Amount", key: "fee_amount", type: "number", value: newStudent.fee_status.amount }],
                        },
                    ].map((section) => (
                        <div key={section.title}>
                            <p className="font-semibold text-[#5a4a3c] text-sm sm:text-base mb-2">{section.title}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {section.fields.map(({ label, key, type, value }) => (
                                    <div key={key} className="flex flex-col">
                                        <input
                                            type={type}
                                            placeholder={label}
                                            value={value}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            className="border border-[#e6c8a8] bg-[#f0d9c0] rounded-lg px-3 py-1.5 sm:py-2 text-sm sm:text-base text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] transition"
                                        />
                                        {formErrors[key] && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors[key]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div>
                        <p className="font-semibold text-[#5a4a3c] text-sm sm:text-base mb-2">Choose Batch to add student in (Optional)</p>
                        {eligibleBatches.length === 0 ? (
                            <motion.div
                                variants={placeholderVariants}
                                animate="pulse"
                                className="flex flex-col items-center justify-center h-12 w-[80%] sm:h-15 text-[#7b5c4b]"
                            >
                                <p className="text-xs sm:text-sm">No batches available for this grade</p>
                            </motion.div>
                        ) : (
                            <select
                                value={selectedBatchId}
                                onChange={(e) => {
                                    setSelectedBatchId(e.target.value);
                                    setNewStudent((prev) => ({
                                        ...prev,
                                        subjectId: [],
                                    }));
                                }}
                                className="w-full border border-[#e6c8a8] bg-[#f0d9c0] rounded-lg px-3 py-1.5 sm:py-2 text-sm sm:text-base text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] transition"
                            >
                                <option value="">No Batch / Deselect</option>
                                {eligibleBatches.map((batch) => (
                                    <option key={batch._id} value={batch._id}>
                                        {batch.name} (Class {batch.forStandard})
                                    </option>
                                ))}
                            </select>
                        )}
                        {formErrors.batchGradeMismatch && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.batchGradeMismatch}</p>}
                        {formErrors.subjectId && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.subjectId}</p>}
                    </div>

                    {selectedBatchId && (
                        <div className="mt-4">
                            <p className="font-semibold text-[#5a4a3c] text-sm sm:text-base mb-2">Select Subjects for this student</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {batches
                                    .find((batch) => batch._id === selectedBatchId)
                                    ?.subject?.map((subject) => (
                                        <label key={subject._id} className="flex items-center space-x-2 text-[#7b5c4b] text-xs sm:text-sm">
                                            <input
                                                type="checkbox"
                                                value={subject._id}
                                                checked={newStudent.subjectId.includes(subject._id)}
                                                onChange={(e) => {
                                                    const subjectId = e.target.value;
                                                    setNewStudent((prev) => {
                                                        const exists = prev.subjectId.includes(subjectId);
                                                        return {
                                                            ...prev,
                                                            subjectId: exists ? prev.subjectId.filter((id) => id !== subjectId) : [...prev.subjectId, subjectId],
                                                        };
                                                    });
                                                }}
                                                className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-[#e0c4a8]"
                                            />
                                            <span>{subject.name}</span>
                                        </label>
                                    ))}
                            </div>
                            {formErrors.subjectId && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.subjectId}</p>}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 sm:gap-4 pt-3 sm:pt-4">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            className="bg-[#e0c4a8] text-[#5a4a3c] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#d7b48f] transition shadow-md text-sm sm:text-base"
                        >
                            {isEditMode ? "Update Student" : "Add Student"}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => (isEditMode ? setEdit(false) : setShowAddStd(false))}
                            className="bg-[#e6c8a8] text-[#5a4a3c] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#d7b48f] transition shadow-md text-sm sm:text-base"
                        >
                            Cancel
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AddStudent;