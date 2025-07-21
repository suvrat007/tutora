import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign,
    Users,
    Building2,
    GraduationCap,
} from "lucide-react";
import WrapperCard from "@/utilities/WrapperCard.jsx";
import useFetchStudents from "@/pages/useFetchStudents.js";
import FeesTable from "@/pages/Fees Management/FeesTable.jsx";


const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const placeholderVariants = {
    pulse: {
        scale: [1, 1.1, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
};

const Fees = () => {
    const { batches, students, totalInstituteFees } = useSelector((state) => state.fees);
    const isLoading = !batches || batches.length === 0;
    const fetchStudents = useFetchStudents();

    const totalPaidAmount = students.reduce((sum, student) => {
        return student.isPaidThisMonth ? sum + (student.amount || 0) : sum;
    }, 0);

    if (isLoading) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <motion.div
                    variants={placeholderVariants}
                    animate="pulse"
                    className="text-center"
                >
                    <DollarSign className="w-12 h-12 text-[#e0c4a8] mx-auto mb-4" />
                    <p className="text-lg text-[#7b5c4b]">Loading fee data...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  p-4 sm:p-6 overflow-y-auto">
            <div className="space-y-6">
                <div className="flex flex-col w-full items-center justify-center">
                    <div className="flex items-center gap-3 sm:justify-left">
                        <h1 className="text-2xl font-bold text-[#5a4a3c]">Fee Management</h1>
                        <DollarSign className="w-6 h-6 text-[#5a4a3c]" />
                    </div>
                </div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                >
                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="bg-[#f8ede3] rounded-3xl h-full p-6 flex items-center justify-center">
                                <div className="text-center flex gap-5">
                                    <div>
                                        <div className="w-16 h-16 bg-[#e0c4a8] rounded-full flex items-center justify-center mx-auto mb-4">
                                            <DollarSign className="w-8 h-8 text-[#5a4a3c]" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-[#5a4a3c] mb-2">Fee Summary</h2>
                                    </div>
                                    <div className="flex flex-col justify-center items-center">
                                        <p className="text-2xl font-bold text-[#5a4a3c]">
                                            ₹{totalInstituteFees.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-[#7b5c4b] mt-1">To Collect</p>
                                        <p className="text-2xl font-bold text-[#5a4a3c] mt-2">
                                            ₹{totalPaidAmount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-[#7b5c4b] mt-1">Collected</p>
                                    </div>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="bg-[#f8ede3] rounded-3xl h-full p-6 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[#e0c4a8] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-[#5a4a3c]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-[#5a4a3c] mb-2">Students</h2>
                                    <p className="text-2xl font-bold text-[#5a4a3c]">{students.length}</p>
                                    <p className="text-sm text-[#7b5c4b] mt-1">Total Enrolled</p>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="bg-[#f8ede3] rounded-3xl h-full p-6 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[#e0c4a8] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-8 h-8 text-[#5a4a3c]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-[#5a4a3c] mb-2">Batches</h2>
                                    <p className="text-2xl font-bold text-[#5a4a3c]">{batches.length}</p>
                                    <p className="text-sm text-[#7b5c4b] mt-1">Active Batches</p>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <WrapperCard>
                        <div className="bg-[#f8ede3] w-full  rounded-3xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <GraduationCap className="w-5 h-5 text-[#5a4a3c]" />
                                <h3 className="text-xl font-semibold text-[#5a4a3c]">Batch-wise Fee Distribution</h3>
                            </div>
                            {batches.length === 0 ? (
                                <motion.div
                                    variants={placeholderVariants}
                                    animate="pulse"
                                    className="flex flex-col items-center justify-center h-[200px] text-[#7b5c4b]"
                                >
                                    <Building2 className="w-12 h-12 text-[#e0c4a8] mb-3" />
                                    <p className="text-sm text-center">No batches available</p>
                                </motion.div>
                            ) : (
                                <div className="flex gap-4 overflow-x-auto">
                                    <AnimatePresence>
                                        {batches.map((batch, index) => (
                                            <motion.div
                                                key={batch.batchId}
                                                variants={fadeInUp}
                                                initial="hidden"
                                                animate="show"
                                                className="bg-[#f8ede3] w-[22em] p-4 rounded-lg border border-[#e6c8a8] hover:shadow-lg transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-[#e0c4a8] flex items-center justify-center text-sm font-bold text-[#5a4a3c]">
                                                        {batch.batchName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-[#5a4a3c]">{batch.batchName}</h4>
                                                        <p className="text-xs text-[#7b5c4b]">Class {batch.forStandard}</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center gap-10">
                                                    <div className="text-center">
                                                        <p className="text-sm text-[#7b5c4b]">Students</p>
                                                        <p className="font-semibold text-[#5a4a3c]">{batch.students.length}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-[#7b5c4b]">Total Fees</p>
                                                        <p className="font-semibold text-[#5a4a3c]">₹{batch.totalFees.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </WrapperCard>
                </motion.div>

                <div className="mb-50 sm:mb-35">
                    <FeesTable
                        batches={batches}
                        students={students}
                        fetchStudents={fetchStudents}
                    />
                </div>

            </div>
        </div>
    );
};

export default Fees;