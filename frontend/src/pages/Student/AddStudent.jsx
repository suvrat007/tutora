import { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { AiOutlineClose } from "react-icons/ai";
import { useSelector } from "react-redux";
import useFetchStudents from "@/pages/useFetchStudents.js";
import useFetchBatches from "@/pages/useFetchBatches.js";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";

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
            feeStatus: [{ date: new Date(), paid: false }]
        },
    });
    const [formErrors, setFormErrors] = useState({});
    const fetchStudents = useFetchStudents();
    const fetchBatches = useFetchBatches();

    useEffect(() => {
        if (isEditMode && existingStudentData) {
            setNewStudent({
                ...existingStudentData,
                fee_status: {
                    amount: existingStudentData.fee_status?.amount || "",
                    feeStatus: existingStudentData.fee_status?.feeStatus?.length > 0
                        ? existingStudentData.fee_status.feeStatus
                        : [{ date: new Date(existingStudentData.admission_date), paid: false }]
                }
            });
            setSelectedBatchId(existingStudentData.batchId || "");
        }
    }, [isEditMode, existingStudentData]);

    const validateForm = () => {
        const errors = {};

        if (!newStudent.name) errors.name = "Student name is required";
        if (!newStudent.grade) errors.grade = "Grade is required";

        if (!isEditMode) {
            if (!newStudent.address) errors.address = "Address is required";
            if (!newStudent.school_name) errors.school_name = "School name is required";
            if (!newStudent.contact_info.emailIds.student) errors.student_email = "Student email is required";
            if (!newStudent.contact_info.phoneNumbers.student) errors.student_phone = "Student phone is required";
            if (!newStudent.contact_info.emailIds.dad) errors.dad_email = "Father email is required";
            if (!newStudent.contact_info.phoneNumbers.dad) errors.dad_phone = "Father phone is required";
            if (!newStudent.contact_info.emailIds.mom) errors.mom_email = "Mother email is required";
            if (!newStudent.contact_info.phoneNumbers.mom) errors.mom_phone = "Mother phone is required";
            if (!newStudent.fee_status.amount) errors.fee_amount = "Fee amount is required";
        }

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
        if (!validateForm()) {
            Object.values(formErrors).forEach(err => toast.error(err));
            return;
        }

        try {
            const studentData = {
                ...newStudent,
                batchId: selectedBatchId || null,
            };

            if (isEditMode && existingStudentData?._id) {
                await axiosInstance.patch(`/api/student/update-student/${existingStudentData._id}`, studentData, {
                    withCredentials: true,
                });
                toast.success("Student updated successfully!");
            } else {
                await axiosInstance.post("/api/student/add-new-student", studentData, { withCredentials: true });
                toast.success("Student added successfully!");
            }

            onStudentAdded();
            setSeeStdDetails((prev) => ({ ...prev, show: false }));
            isEditMode ? setEdit(false) : setShowAddStd(false);
        } catch (err) {
            toast.error("Failed to submit student data.");
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
    const inputClass = "w-full border border-border rounded-lg px-3 py-2 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed text-text inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-[50em] bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
                <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                    <h2 className="text-lg font-semibold">{isEditMode ? "Edit Student" : "Add New Student"}</h2>
                    <button onClick={() => (isEditMode ? setEdit(false) : setShowAddStd(false))} className="text-text-light hover:text-error transition">
                        <AiOutlineClose size={24} />
                    </button>
                </div>

                <div className="p-4 space-y-6 max-h-[75vh] overflow-y-auto">
                    {isEditMode && (
                        <div className="flex items-center justify-center p-4">
                            <img
                                src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                                alt="Student Avatar"
                                className="w-40 rounded-full border border-border"
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
                            <p className="font-semibold mb-2 text-text">{section.title}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.fields.map(({ label, key, type, value }) => (
                                    <div key={key} className="flex flex-col">
                                        <Input
                                            type={type}
                                            placeholder={label}
                                            value={value}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            className={inputClass}
                                        />
                                        {formErrors[key] && <p className="text-error text-sm">{formErrors[key]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div>
                        <p className="font-semibold mb-2 text-text">Choose Batch to add student in (Optional)</p>
                        <select
                            value={selectedBatchId}
                            onChange={(e) => {
                                setSelectedBatchId(e.target.value);
                                setNewStudent((prev) => ({
                                    ...prev,
                                    subjectId: [],
                                }));
                            }}
                            className={inputClass}
                        >
                            <option value="">No Batch / Deselect</option>
                            {eligibleBatches.map((batch) => (
                                <option key={batch._id} value={batch._id}>
                                    {batch.name} (Class {batch.forStandard})
                                </option>
                            ))}
                        </select>
                        {formErrors.batch && <p className="text-error text-sm">{formErrors.batch}</p>}
                        {formErrors.batchGradeMismatch && <p className="text-error text-sm">{formErrors.batchGradeMismatch}</p>}
                    </div>

                    {selectedBatchId && (
                        <div className="mt-4">
                            <p className="font-semibold mb-2 text-text">Select Subjects for this student</p>
                            <div className="grid grid-cols-2 gap-3">
                                {batches
                                    .find((batch) => batch._id === selectedBatchId)
                                    ?.subject?.map((subject) => (
                                        <label key={subject._id} className="flex items-center space-x-2 text-text">
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
                                                className="form-checkbox h-4 w-4 text-primary"
                                            />
                                            <span>{subject.name}</span>
                                        </label>
                                    ))}
                            </div>
                            {formErrors.subjectId && <p className="text-error text-sm">{formErrors.subjectId}</p>}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={handleSubmit}>
                            {isEditMode ? "Update Student" : "Add Student"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AddStudent;