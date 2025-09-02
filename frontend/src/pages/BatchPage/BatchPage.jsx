import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/utilities/axiosInstance";
import { addBatches } from "@/utilities/redux/batchSlice.js";
import useFetchBatches from "@/pages/useFetchBatches.js";
import WrapperCard from "@/utilities/WrapperCard.jsx";
import { BookOpen, Users, FileText} from "lucide-react"
import { AiOutlinePlus } from "react-icons/ai";
import ViewBatchDetails from "@/pages/BatchPage/ViewBatchDetails.jsx";
import CreateEditBatch from "@/pages/BatchPage/CreateEditBatch.jsx";
import ConfirmationModal from "@/pages/BatchPage/ConfirmationModal.jsx";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

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

const BatchPage = () => {
    const [createBatches, setCreateBatches] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState(null);
    const [viewDetails, setViewDetails] = useState({ display: false, batch: null });
    const [isLoading, setIsLoading] = useState(false);

    const adminData = useSelector((state) => state.user);
    const batches = useSelector((state) => state.batches);
    const groupedStudents = useSelector((state) => state.students.groupedStudents);
    const dispatch = useDispatch();
    const fetchBatches = useFetchBatches();

    

    const handleDelete = async (id, shouldDeleteStudents) => {
        setBatchToDelete(null);
        setIsLoading(true);
        try {
            const response = await axiosInstance.delete(`/api/batch/delete-batch/${id}`, {
                data: { shouldDeleteStudents },
                withCredentials: true,
            });

            if (response.status !== 200) throw new Error("Failed to delete the batch");

            toast.success("Batch successfully deleted.");
            await fetchBatches();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong during deletion.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (batch, studentsForBatch) => {
        setViewDetails({ display: true, batch, studentsForBatch });
    };

    const handleBatchUpdated = (updatedBatch) => {
        dispatch(addBatches(batches.map((b) => (b._id === updatedBatch._id ? updatedBatch : b))));
    };

    const closeViewDetails = () => {
        setViewDetails({ display: false, batch: null });
    };

    const LoadingSpinner = () => (
        <motion.div
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="w-12 h-12 border-4 border-[#e0c4a8] border-t-transparent rounded-full animate-spin" />
        </motion.div>
    );

    const CreateBatchCard = () => (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            onClick={() => !isLoading && setCreateBatches(true)}
            className={`flex flex-col justify-center items-center rounded-3xl p-4 border-2 border-dashed border-[#e6c8a8] 
            bg-[#f8ede3] hover:bg-[#f0d9c0] transition-all cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.15)] 
            hover:shadow-lg ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            <AiOutlinePlus className="text-5xl text-[#5a4a3c] mb-2 sm:mb-4 " />
            <span className="text-xl font-medium text-[#5a4a3c] m-2">Create New Batch</span>
        </motion.div>
    );

    const BatchCard = ({ batch, index }) => {
        const studentCount = groupedStudents.find((g) => g.batchId === batch._id)?.students?.length || 0;

        const infoSections = [
            { title: "Grade", value: batch.forStandard ?? "N/A", icon: <BookOpen className="text-[#e0c4a8]" /> },
            { title: "Total Students", value: studentCount, icon: <Users className="text-[#e0c4a8]" /> },
            { title: "Total Subjects", value: batch.subject?.length ?? 0, icon: <FileText className="text-[#e0c4a8]" /> },
        ];

        return (
            <motion.div
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="rounded-3xl bg-[#f8ede3] border border-[#e6c8a8] shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:shadow-lg transition-all flex flex-col"
            >
                <div className="border-b border-[#e6c8a8] px-4 py-3 bg-[#f0d9c0] rounded-t-3xl">
                    <h3 className="text-center font-semibold text-lg text-[#5a4a3c] truncate" title={batch.name}>
                        {batch.name}
                    </h3>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="space-y-3">
                        {infoSections.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-[#f0d9c0] rounded-lg">
                                <div className="flex items-center gap-2">
                                    {item.icon}
                                    <span className="text-sm text-[#5a4a3c]">{item.title}</span>
                                </div>
                                <span className="font-semibold text-[#5a4a3c]">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoading}
                            onClick={() => {
                                const studentsForBatch = groupedStudents.find((g) => g.batchId === batch._id)?.students || [];
                                handleViewDetails(batch, studentsForBatch);
                            }}
                            className="flex-1 py-2 px-3 text-sm border border-[#e6c8a8] text-[#5a4a3c] rounded-lg hover:bg-[#e0c4a8] hover:text-[#5a4a3c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            View Details
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", color: "#FF3B30" }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoading}
                            onClick={() => setBatchToDelete(batch._id)}
                            className="flex-1 py-2 px-3 text-sm border border-[#e6c8a8] text-[#5a4a3c] rounded-lg hover:bg-[#FF3B30] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const ModalBackdrop = ({ onClose, children }) => (
        <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </motion.div>
    );

    const MainContent = () => (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="p-6 bg-[#f8ede3] h-full overflow-y-auto rounded-3xl"
        >
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#5a4a3c] mb-2">Batch Management</h1>
                <p className="text-[#7b5c4b]">{adminData?.institute_info?.name || "Institute"}</p>
            </div>
            {batches.length === 0 ? (
                <motion.div
                    variants={placeholderVariants}
                    animate="pulse"
                    onClick={() => !isLoading && setCreateBatches(true)}
                    className="text-center py-12 cursor-pointer mx-10 "
                >
                    <h3 className="text-xl font-semibold text-[#5a4a3c] mb-2">No batches yet</h3>
                    <p className="text-[#7b5c4b]">Click here and create your first batch to get started</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <CreateBatchCard />
                    <AnimatePresence>
                        {batches.map((batch, index) => (
                            <BatchCard key={batch._id} batch={batch} index={index} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="h-full p-4 overflow-y-auto">
            <WrapperCard className="h-full w-full">
                {viewDetails.display ? (
                    <ViewBatchDetails
                        viewDetails={viewDetails}
                        setViewDetails={setViewDetails}
                        onClose={closeViewDetails}
                    />
                ) : (
                    <MainContent />
                )}
            </WrapperCard>
            {createBatches && (
                <ModalBackdrop onClose={() => setCreateBatches(false)}>
                    <CreateEditBatch
                        onClose={() => setCreateBatches(false)}
                        handleBatchUpdated={handleBatchUpdated}
                        handleViewDetails={handleViewDetails}
                        batchToEdit={null}
                    />
                </ModalBackdrop>
            )}
            {batchToDelete && (
                <ConfirmationModal
                    closeModal={() => setBatchToDelete(null)}
                    onClose={(shouldDeleteStudents) => handleDelete(batchToDelete, shouldDeleteStudents)}
                />
            )}
            {isLoading && <LoadingSpinner />}
        </div>
    );
};

export default BatchPage;