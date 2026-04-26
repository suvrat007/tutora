import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign,
    Users,
    Building2,
    GraduationCap,
} from "lucide-react";
import WrapperCard from "@/utilities/WrapperCard.jsx";
import FeesTable from "@/pages/Fees Management/FeesTable.jsx";
import axiosInstance from "@/utilities/axiosInstance.jsx";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const placeholderVariants = {
    pulse: {
        scale: [1, 1.1, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
};

const Fees = () => {
    const currentMonth = `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`;
    const [monthFilter, setMonthFilter] = useState(currentMonth);

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        globalStats: { totalInstituteFees: 0, totalPaidAmount: 0, studentsCount: 0 },
        batchWise: []
    });

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`student/fees/dashboard-summary?month=${encodeURIComponent(monthFilter === "Present Month" ? currentMonth : monthFilter)}`, { withCredentials: true });
            setSummary(response.data);
        } catch (error) {
            console.error("Failed to fetch fee dashboard summary", error);
        } finally {
            setLoading(false);
        }
    }, [monthFilter, currentMonth]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const { globalStats, batchWise } = summary;

    if (loading && !globalStats.totalInstituteFees) {
        return (
            <div className="h-full m-4 flex items-center justify-center">
                <motion.div variants={placeholderVariants} animate="pulse" className="text-center">
                    <DollarSign className="w-12 h-12 text-[#e0c4a8] mx-auto mb-4 animate-spin-slow" />
                    <p className="text-lg text-[#7b5c4b]">Loading beautiful analytics...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 overflow-y-auto">
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
                            <div className="bg-[#f8ede3] rounded-3xl h-full p-6 flex items-center justify-center relative overflow-hidden">
                                {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#5a4a3c] rounded-full border-t-transparent animate-spin"></div></div>}
                                <div className="text-center flex gap-5">
                                    <div>
                                        <div className="w-16 h-16 bg-[#e0c4a8] rounded-full flex items-center justify-center mx-auto mb-4">
                                            <DollarSign className="w-8 h-8 text-[#5a4a3c]" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-[#5a4a3c] mb-2">Fee Summary</h2>
                                    </div>
                                    <div className="flex flex-col justify-center items-center">
                                        <p className="text-2xl font-bold text-[#5a4a3c]">
                                            ₹{globalStats.totalInstituteFees.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-[#7b5c4b] mt-1">To Collect</p>
                                        <p className="text-2xl font-bold text-[#2fb344] mt-2 border-t border-[#e0c4a8] pt-2">
                                            ₹{globalStats.totalPaidAmount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-[#7b5c4b] mt-1">
                                            Collected {monthFilter === "Present Month" ? "this month" : `in ${monthFilter}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="bg-[#f8ede3] rounded-3xl h-full p-6 flex items-center justify-center relative overflow-hidden">
                                {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#5a4a3c] rounded-full border-t-transparent animate-spin"></div></div>}
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[#e0c4a8] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-[#5a4a3c]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-[#5a4a3c] mb-2">Students</h2>
                                    <p className="text-2xl font-bold text-[#5a4a3c]">{globalStats.studentsCount}</p>
                                    <p className="text-sm text-[#7b5c4b] mt-1">Total Enrolled</p>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="bg-[#f8ede3] rounded-3xl h-full p-6 flex items-center justify-center relative overflow-hidden">
                                {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#5a4a3c] rounded-full border-t-transparent animate-spin"></div></div>}
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[#e0c4a8] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-8 h-8 text-[#5a4a3c]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-[#5a4a3c] mb-2">Batches</h2>
                                    <p className="text-2xl font-bold text-[#5a4a3c]">{batchWise.length}</p>
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
                        <div className="bg-[#f8ede3] w-full rounded-3xl p-6 relative min-h-[15em]">
                            {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl"><div className="w-8 h-8 border-4 border-[#5a4a3c] rounded-full border-t-transparent animate-spin"></div></div>}
                            <div className="flex items-center gap-2 mb-4">
                                <GraduationCap className="w-5 h-5 text-[#5a4a3c]" />
                                <h3 className="text-xl font-semibold text-[#5a4a3c]">Batch-wise Fee Distribution</h3>
                            </div>
                            {batchWise.length === 0 ? (
                                <motion.div
                                    variants={placeholderVariants}
                                    animate="pulse"
                                    className="flex flex-col items-center justify-center h-[200px] text-[#7b5c4b]"
                                >
                                    <Building2 className="w-12 h-12 text-[#e0c4a8] mb-3" />
                                    <p className="text-sm text-center">No batches available</p>
                                </motion.div>
                            ) : (
                                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                    <AnimatePresence>
                                        {batchWise.map((batch) => (
                                            <motion.div
                                                key={batch.batchId}
                                                variants={fadeInUp}
                                                initial="hidden"
                                                animate="show"
                                                className="bg-white min-w-[22em] p-4 rounded-xl border border-[#e6c8a8] hover:shadow-lg transition-all duration-300 relative group"
                                            >
                                                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#e0c4a8]/30 flex items-center justify-center text-sm font-bold text-[#5a4a3c] uppercase shadow-sm">
                                                        {batch.batchName.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-[#5a4a3c] text-lg">{batch.batchName}</h4>
                                                        {batch.forStandard && <p className="text-xs text-[#7b5c4b] font-medium bg-[#e0c4a8]/20 inline-block px-2 py-0.5 rounded-full mt-1">Class {batch.forStandard}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center gap-6">
                                                    <div className="text-left">
                                                        <p className="text-xs text-[#7b5c4b] uppercase tracking-wider font-semibold mb-1">Students</p>
                                                        <p className="text-lg font-bold text-[#5a4a3c] bg-gray-50 px-3 py-1 rounded-md border border-gray-100">{batch.studentsCount}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-[#7b5c4b] uppercase tracking-wider font-semibold mb-1">Total Fees</p>
                                                        <p className="text-lg font-bold text-[#2fb344] bg-green-50 px-3 py-1 rounded-md border border-green-100">₹{batch.totalFees.toLocaleString()}</p>
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
                        monthFilter={monthFilter}
                        setMonthFilter={setMonthFilter}
                        onSaveComplete={fetchSummary}
                    />
                </div>
            </div>
        </div>
    );
};

export default Fees;