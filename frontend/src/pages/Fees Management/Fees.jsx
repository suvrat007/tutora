import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Users, Building2, GraduationCap, TrendingUp } from "lucide-react";
import FeesTable from "@/pages/Fees Management/FeesTable.jsx";
import axiosInstance from "@/utilities/axiosInstance.jsx";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", delay: i * 0.08 } }),
};

const Fees = () => {
    const currentMonth = `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`;
    const [monthFilter, setMonthFilter] = useState(currentMonth);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        globalStats: { totalInstituteFees: 0, totalPaidAmount: 0, studentsCount: 0 },
        batchWise: [],
    });

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                `student/fees/dashboard-summary?month=${encodeURIComponent(monthFilter === "Present Month" ? currentMonth : monthFilter)}`,
                { withCredentials: true }
            );
            setSummary(response.data);
        } catch (error) {
            console.error("Failed to fetch fee dashboard summary", error);
        } finally {
            setLoading(false);
        }
    }, [monthFilter, currentMonth]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    const { globalStats, batchWise } = summary;
    const collectionPct = globalStats.totalInstituteFees > 0
        ? Math.min(100, Math.round((globalStats.totalPaidAmount / globalStats.totalInstituteFees) * 100))
        : 0;

    return (
        <div className="p-4 sm:p-6 overflow-y-auto h-full flex flex-col gap-6">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#e0c4a8] rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-[#5a4a3c]" />
                </div>
                <h1 className="text-xl font-bold text-[#5a4a3c]">Fee Management</h1>
                {loading && (
                    <div className="w-4 h-4 border-2 border-[#e0c4a8] border-t-[#8b5e3c] rounded-full animate-spin ml-1" />
                )}
            </div>

            {/* ── Top stat cards ──────────────────────────────────────── */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            >
                {/* Fee Summary — wider feel */}
                <motion.div variants={fadeUp} custom={0} className="md:col-span-2">
                    <div className="relative bg-white border border-[#e6c8a8] rounded-2xl p-5 h-full overflow-hidden">
                        {loading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                <div className="w-5 h-5 border-2 border-[#e0c4a8] border-t-[#8b5e3c] rounded-full animate-spin" />
                            </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs font-semibold text-[#a08a78] uppercase tracking-wider mb-1">Fee Summary</p>
                                <p className="text-sm text-[#7b5c4b]">{monthFilter === "Present Month" ? currentMonth : monthFilter}</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#f0fdf4] border border-green-100 px-2.5 py-1 rounded-full">
                                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs font-bold text-green-700">{collectionPct}%</span>
                            </div>
                        </div>

                        <div className="flex gap-8 mb-4">
                            <div>
                                <p className="text-2xl font-bold text-[#2fb344]">
                                    ₹{globalStats.totalPaidAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-[#7b5c4b] mt-0.5">Collected</p>
                            </div>
                            <div className="w-px bg-[#e6c8a8]" />
                            <div>
                                <p className="text-2xl font-bold text-[#5a4a3c]">
                                    ₹{globalStats.totalInstituteFees.toLocaleString()}
                                </p>
                                <p className="text-xs text-[#7b5c4b] mt-0.5">Total to Collect</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-[#f0e8df] rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="h-2 rounded-full bg-[#2fb344]"
                                initial={{ width: 0 }}
                                animate={{ width: `${collectionPct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                            />
                        </div>
                        <p className="text-xs text-[#a08a78] mt-1.5">
                            ₹{(globalStats.totalInstituteFees - globalStats.totalPaidAmount).toLocaleString()} remaining
                        </p>
                    </div>
                </motion.div>

                {/* Students + Batches stacked */}
                <motion.div variants={fadeUp} custom={1} className="flex flex-col gap-4">
                    <div className="relative bg-white border border-[#e6c8a8] rounded-2xl p-5 flex-1 overflow-hidden">
                        {loading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                <div className="w-5 h-5 border-2 border-[#e0c4a8] border-t-[#8b5e3c] rounded-full animate-spin" />
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#f0e8df] rounded-xl flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 text-[#8b5e3c]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#5a4a3c]">{globalStats.studentsCount}</p>
                                <p className="text-xs text-[#7b5c4b] font-medium">Total Students</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative bg-white border border-[#e6c8a8] rounded-2xl p-5 flex-1 overflow-hidden">
                        {loading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                <div className="w-5 h-5 border-2 border-[#e0c4a8] border-t-[#8b5e3c] rounded-full animate-spin" />
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#f0e8df] rounded-xl flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 text-[#8b5e3c]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#5a4a3c]">{batchWise.length}</p>
                                <p className="text-xs text-[#7b5c4b] font-medium">Active Batches</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── Batch-wise distribution ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.35 }}
            >
                <div className="bg-white border border-[#e6c8a8] rounded-2xl p-5 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                            <div className="w-6 h-6 border-2 border-[#e0c4a8] border-t-[#8b5e3c] rounded-full animate-spin" />
                        </div>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                        <GraduationCap className="w-4 h-4 text-[#8b5e3c]" />
                        <h3 className="text-sm font-semibold text-[#5a4a3c]">Batch-wise Fee Distribution</h3>
                    </div>

                    {batchWise.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-[#a08a78]">
                            <Building2 className="w-10 h-10 text-[#e0c4a8] mb-2" />
                            <p className="text-sm">No batches available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            <AnimatePresence>
                                {batchWise.map((batch, i) => {
                                    return (
                                        <motion.div
                                            key={batch.batchId}
                                            custom={i}
                                            variants={fadeUp}
                                            initial="hidden"
                                            animate="show"
                                            className="bg-[#faf7f4] border border-[#e6c8a8] rounded-xl p-4 hover:shadow-md hover:border-[#d4b896] transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#e0c4a8] flex items-center justify-center text-xs font-bold text-[#5a4a3c] uppercase flex-shrink-0">
                                                    {batch.batchName.substring(0, 2)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-[#5a4a3c] text-sm truncate">{batch.batchName}</p>
                                                    {batch.forStandard && (
                                                        <p className="text-xs text-[#a08a78]">Class {batch.forStandard}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between text-xs text-[#a08a78] mb-2">
                                                <span>{batch.studentsCount} students</span>
                                                <span className="font-semibold text-[#2fb344]">₹{batch.totalFees.toLocaleString()}</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── Fee table ───────────────────────────────────────────── */}
            <div className="mb-16 sm:mb-8">
                <FeesTable
                    monthFilter={monthFilter}
                    setMonthFilter={setMonthFilter}
                    onSaveComplete={fetchSummary}
                />
            </div>
        </div>
    );
};

export default Fees;
