import { useState } from "react";
import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import { motion } from "framer-motion";
import AddStudent from "@/pages/Student/AddStudent.jsx";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const StdDataDisplay = ({ seeStdDetails, setSeeStdDetails, onStudentEdited }) => {
    const [edit, setEdit] = useState(false);

    const handleStudentAdded = () => {
        console.log("Student was added or edited!");
        onStudentEdited();
    };

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="bg-[#f8ede3] border border-[#e6c8a8] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden h-full overflow-y-auto"
        >
            {edit && (
                <AddStudent
                    batchId={seeStdDetails.stdDetails?.batchId}
                    existingStudentData={seeStdDetails.stdDetails}
                    isEditMode={edit}
                    setEdit={setEdit}
                    setSeeStdDetails={setSeeStdDetails}
                    setShowAddStd={() => setSeeStdDetails({ ...seeStdDetails, show: false })}
                    onStudentAdded={onStudentEdited}
                />
            )}
            <div className="flex justify-between p-2 sm:p-3">
                <motion.button
                    whileHover={{ scale: 1.1, color: "#34C759" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEdit(true)}
                    className="text-[#e0c4a8] hover:text-[#34C759] transition ml-2"
                >
                    <AiOutlineEdit className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1, color: "#FF3B30" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSeeStdDetails((prev) => ({ ...prev, show: false }))}
                    className="text-[#e0c4a8] hover:text-[#FF3B30] transition mr-2"
                >
                    <AiOutlineClose className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
            </div>
            <div className="flex flex-col items-center text-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-[#e6c8a8] break-words truncate">
                <motion.img
                    src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                    alt="Student Avatar"
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border border-[#e6c8a8] shadow"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                />
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#5a4a3c] truncate w-full">
                    {seeStdDetails.stdDetails?.name || "Unnamed Student"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-[#7b5c4b] w-full">
                    <span className="font-medium text-[#5a4a3c]">School:</span>
                    <span className="truncate">{seeStdDetails.stdDetails?.school_name || "N/A"}</span>
                    <span className="font-medium text-[#5a4a3c]">Grade:</span>
                    <span>{seeStdDetails.stdDetails?.grade || "N/A"}</span>
                    <span className="font-medium text-[#5a4a3c]">Admission Date:</span>
                    <span className="truncate">{seeStdDetails.stdDetails?.admission_date || "N/A"}</span>
                    <span className="font-medium text-[#5a4a3c]">Email:</span>
                    <span className="truncate">{seeStdDetails.stdDetails?.contact_info.emailIds.student || "N/A"}</span>
                    <span className="font-medium text-[#5a4a3c]">Phone No.:</span>
                    <span className="truncate">{seeStdDetails.stdDetails?.contact_info.phoneNumbers.student || "N/A"}</span>
                    <span className="font-medium text-[#5a4a3c]">Address:</span>
                    <span className="truncate">{seeStdDetails.stdDetails?.address || "N/A"}</span>
                </div>
            </div>
            <div className="gap-2 p-3 sm:p-4 break-words truncate">
                <h3 className="text-base sm:text-lg font-semibold text-[#5a4a3c] mb-2">Parent Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-[#7b5c4b]">
                    <span className="font-medium text-[#5a4a3c]">Father's Phone:</span>
                    <span className="truncate">{seeStdDetails.stdDetails?.contact_info.phoneNumbers.dad || "N/A"}</span>
                    <span className="font-medium text-[#5a4a3c]">Father's Email:</span>
                    <span className="truncate">{seeStdDetails.stdDetails?.contact_info.emailIds.dad || "N/A"}</span>
                    <span className="font-medium text-[#5a4a3c]">Mother's Phone:</span>
                    <span className="truncate">{seeStdDetails.stdDetails?.contact_info.phoneNumbers.mom || "N/A"}</span>
                    <span className="font-medium text-[#5a4a3c]">Mother's Email:</span>
                    <span className="truncate">{seeStdDetails.stdDetails?.contact_info.emailIds.mom || "N/A"}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default StdDataDisplay;