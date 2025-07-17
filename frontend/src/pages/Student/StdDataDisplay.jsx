import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import { useState } from "react";
import AddStudent from "./AddStudent.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button.jsx";

const StdDataDisplay = ({ seeStdDetails, setSeeStdDetails, onStudentEdited }) => {
    const [edit, setEdit] = useState(false);

    const handleStudentAdded = () => {
        onStudentEdited();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-soft border border-border flex flex-col h-full overflow-y-auto p-6"
        >
            className="bg-white rounded-2xl shadow-soft border border-border flex flex-col h-full overflow-y-auto p-6"
        >
            {edit && (
                <AddStudent
                    existingStudentData={seeStdDetails.stdDetails}
                    isEditMode={edit}
                    setEdit={setEdit}
                    setSeeStdDetails={setSeeStdDetails}
                    setShowAddStd={() => setSeeStdDetails({ ...seeStdDetails, show: false })}
                    onStudentAdded={handleStudentAdded}
                />
            )}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-text">Student Details</h2>
                <div className="flex gap-2">
                    <Button onClick={() => setEdit(true)} size="sm" variant="outline">
                        <AiOutlineEdit className="mr-1" /> Edit
                    </Button>
                    <Button onClick={() => setSeeStdDetails((prev) => ({ ...prev, show: false }))} size="sm" variant="outline">
                        <AiOutlineClose className="mr-1" /> Close
                    </Button>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-4 border-b border-border break-words">
                <img
                    src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                    alt="Student Avatar"
                    className="w-28 h-28 rounded-full object-cover border border-border shadow-sm"
                />
                <h2 className="text-2xl font-semibold text-text">{seeStdDetails.stdDetails?.name || "Unnamed Student"}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-text-light w-full">
                    <span className="font-medium">School:</span>
                    <span>{seeStdDetails.stdDetails?.school_name || "N/A"}</span>
                    <span className="font-medium">Grade:</span>
                    <span>{seeStdDetails.stdDetails?.grade || "N/A"}</span>
                    <span className="font-medium">Admission Date:</span>
                    <span>{seeStdDetails.stdDetails?.admission_date ? new Date(seeStdDetails.stdDetails.admission_date).toLocaleDateString() : "N/A"}</span>
                    <span className="font-medium">Email:</span>
                    <span>{seeStdDetails.stdDetails?.contact_info.emailIds.student || "N/A"}</span>
                    <span className="font-medium">Phone No.:</span>
                    <span>{seeStdDetails.stdDetails?.contact_info.phoneNumbers.student || "N/A"}</span>
                    <span className="font-medium">Address:</span>
                    <span>{seeStdDetails.stdDetails?.address || "N/A"}</span>
                </div>
            </div>
            <div className="gap-2 p-6 break-words">
                <h3 className="text-lg font-semibold text-text mb-2">Parent Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-text-light">
                    <span className="font-medium">Father's Phone:</span>
                    <span>{seeStdDetails.stdDetails?.contact_info.phoneNumbers.dad || "N/A"}</span>
                    <span className="font-medium">Father's Email:</span>
                    <span>{seeStdDetails.stdDetails?.contact_info.emailIds.dad || "N/A"}</span>
                    <span className="font-medium">Mother's Phone:</span>
                    <span>{seeStdDetails.stdDetails?.contact_info.phoneNumbers.mom || "N/A"}</span>
                    <span className="font-medium">Mother's Email:</span>
                    <span>{seeStdDetails.stdDetails?.contact_info.emailIds.mom || "N/A"}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default StdDataDisplay;