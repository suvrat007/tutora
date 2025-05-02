import { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { AiOutlineClose } from "react-icons/ai";

const AddStudent = ({
                        batchId,
                        setEdit,
                        onStudentAdded,
                        setShowAddStd,
                        existingStudentData = null,
                        isEditMode = false,
                    }) => {
    const [newStudent, setNewStudent] = useState({
        name: "",
        address: "",
        grade: "",
        school_name: "",
        contact_info: {
            emailIds: { student: "", mom: "", dad: "" },
            phoneNumbers: { student: "", mom: "", dad: "" },
        },
        fee_status: { amount: "" },
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        document.body.style.overflow = "hidden";
        if (existingStudentData) {
            setNewStudent(existingStudentData);
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [existingStudentData]);

    const validateForm = () => {
        const errors = {};
        if (!newStudent.name) errors.name = "Student name is required";
        if (!newStudent.address) errors.address = "Address is required";
        if (!newStudent.grade) errors.grade = "Grade is required";
        if (!newStudent.school_name) errors.school_name = "School name is required";
        if (!newStudent.contact_info.emailIds.student) errors.student_email = "Student email is required";
        if (!newStudent.contact_info.phoneNumbers.student) errors.student_phone = "Student phone is required";
        if (!newStudent.contact_info.emailIds.dad) errors.father_email = "Father email is required";
        if (!newStudent.contact_info.phoneNumbers.dad) errors.father_phone = "Father phone is required";
        if (!newStudent.contact_info.emailIds.mom) errors.mother_email = "Mother email is required";
        if (!newStudent.contact_info.phoneNumbers.mom) errors.mother_phone = "Mother phone is required";
        if (!newStudent.fee_status.amount) errors.fee_amount = "Fee amount is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        try {
            if (isEditMode && existingStudentData?._id) {
                const response = await axiosInstance.put(`/update-student/${existingStudentData._id}`, newStudent);
                console.log("Student updated:", response.data);
            } else {
                const studentData = { ...newStudent };
                const response = await axiosInstance.post(`/add-new-student`, studentData);
                const newStudentId = response.data.student._id;
                await axiosInstance.put(`/update-batch-with-student/${batchId}`, {
                    newStudentId,
                });
            }
            onStudentAdded();
            isEditMode ? (setEdit(false) , setShowAddStd()) : setShowAddStd(false);
        } catch (err) {
            console.error("Error submitting student data:", err);
            alert("Failed to submit student data.");
        }
    };

    const handleChange = (key, value) => {
        switch (key) {
            case "student_email":
            case "dad_email":
            case "mom_email":
                setNewStudent(prev => ({
                    ...prev,
                    contact_info: {
                        ...prev.contact_info,
                        emailIds: {
                            ...prev.contact_info.emailIds,
                            [key.split("_")[0]]: value,
                        },
                    },
                }));
                break;
            case "student_phone":
            case "dad_phone":
            case "mom_phone":
                setNewStudent(prev => ({
                    ...prev,
                    contact_info: {
                        ...prev.contact_info,
                        phoneNumbers: {
                            ...prev.contact_info.phoneNumbers,
                            [key.split("_")[0]]: value,
                        },
                    },
                }));
                break;
            case "fee_amount":
                setNewStudent(prev => ({
                    ...prev,
                    fee_status: {
                        ...prev.fee_status,
                        amount: value,
                    },
                }));
                break;
            default:
                setNewStudent(prev => ({
                    ...prev,
                    [key]: value,
                }));
        }
    };

    const formSections = [
        {
            title: "General Info",
            fields: [
                { label: "Student Name", key: "name", type: "text", value: newStudent.name },
                { label: "Grade", key: "grade", type: "number", value: newStudent.grade },
                { label: "School Name", key: "school_name", type: "text", value: newStudent.school_name },
                { label: "Address", key: "address", type: "text", value: newStudent.address },
            ]
        },
        {
            title: "Student's Contact",
            fields: [
                { label: "Student Email", key: "student_email", type: "email", value: newStudent.contact_info.emailIds.student },
                { label: "Student Phone", key: "student_phone", type: "text", value: newStudent.contact_info.phoneNumbers.student },
            ]
        },
        {
            title: "Parent's Contact",
            fields: [
                { label: "Father Email", key: "dad_email", type: "email", value: newStudent.contact_info.emailIds.dad },
                { label: "Father Phone", key: "dad_phone", type: "text", value: newStudent.contact_info.phoneNumbers.dad },
                { label: "Mother Email", key: "mom_email", type: "email", value: newStudent.contact_info.emailIds.mom },
                { label: "Mother Phone", key: "mom_phone", type: "text", value: newStudent.contact_info.phoneNumbers.mom },
            ]
        },
        {
            title: "Fee Details",
            fields: [
                { label: "Fee Amount", key: "fee_amount", type: "number", value: newStudent.fee_status.amount },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-[50em] bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {isEditMode ? "Edit Student" : "Add New Student"}
                    </h2>
                    <button
                        onClick={() => {
                            isEditMode ? setEdit(false) : setShowAddStd(false);
                        }}
                        className="text-gray-500 hover:text-red-500 transition"
                    >
                        <AiOutlineClose size={24} />
                    </button>
                </div>
                <div className="p-4 space-y-6 max-h-[75vh] overflow-y-auto">
                    <div className="flex items-center justify-center p-4">
                        <img
                            src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                            alt="Student Avatar"
                            className="w-40 rounded-full border"
                        />
                    </div>
                    {formSections.map((section) => (
                        <div key={section.title}>
                            <p className="font-semibold mb-2">{section.title}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.fields.map(({ label, key, type, value }) => (
                                    <div key={key} className="flex flex-col">
                                        <input
                                            type={type}
                                            placeholder={label}
                                            value={value}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors[key] && (
                                            <p className="text-red-500 text-sm">{formErrors[key]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end p-4 border-t">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        {isEditMode ? "Save Changes" : "Add Student"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddStudent;
