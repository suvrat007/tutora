import { useSelector } from "react-redux";
import { IndianRupee, CheckCircle2, Clock3 } from "lucide-react";
import { motion } from "framer-motion";

const FeeCollection = () => {
    const feeSummary = useSelector(s => s.feeSummary);

    const globalStats = feeSummary?.globalStats;
    const collected = globalStats?.totalPaidAmount ?? 0;
    const total = globalStats?.totalInstituteFees ?? 0;
    const studentsCount = globalStats?.studentsCount ?? 0;
    const pending = feeSummary?.pendingStudents ?? [];
    const paidCount = studentsCount - pending.length;

    const pct = total > 0 ? (collected / total) * 100 : 0;
    const fmt = n => new Intl.NumberFormat("en-IN").format(n);
    const month = new Date().toLocaleString("default", { month: "long", year: "numeric" });

    return (
        <div className="bg-[#f8ede3] rounded-3xl border border-[#e6c8a8] shadow-xl p-4 sm:p-6 h-full flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold text-[#5a4a3c] border-b border-[#e6c8a8] pb-2.5 mb-4 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[#c47d3e]" />
                Fee Collection — {month}
            </h2>

            <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-2xl font-bold text-[#2c1a0e]">₹{fmt(collected)}</p>
                        <p className="text-xs text-[#b0998a]">of ₹{fmt(total)} expected</p>
                    </div>
                    <span
                        className="text-3xl font-extrabold"
                        style={{ color: pct >= 75 ? "#4a7c59" : pct >= 40 ? "#c47d3e" : "#b94444" }}
                    >
                        {pct.toFixed(0)}%
                    </span>
                </div>

                <div className="h-3 bg-[#e6c8a8] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #8b5e3c, #c47d3e)" }}
                    />
                </div>

                <div className="flex justify-between text-xs text-[#b0998a] mt-2">
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        {paidCount} paid
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock3 className="w-3 h-3 text-amber-500" />
                        {pending.length} pending
                    </span>
                </div>
            </div>

            <p className="text-xs font-semibold text-[#b0998a] uppercase tracking-wider mb-2">
                Still to collect from
            </p>
            <div className="max-h-56 sm:max-h-none sm:flex-1 overflow-y-auto space-y-2 pr-1">
                {pending.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-[#7b5c4b]">
                        <CheckCircle2 className="w-9 h-9 text-green-500" />
                        <p className="text-sm font-medium">All fees collected this month!</p>
                    </div>
                ) : (
                    pending.map((s, i) => (
                        <motion.div
                            key={s.studentId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.3 }}
                            className="flex items-center justify-between bg-white border border-[#e6c8a8] rounded-xl px-4 py-2.5 shadow-sm"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#2c1a0e] truncate">{s.name}</p>
                                <p className="text-xs text-[#b0998a] truncate">{s.batchName}</p>
                            </div>
                            <p className="text-sm font-bold text-[#8b5e3c] flex-shrink-0 ml-3">
                                ₹{fmt(s.amount)}
                            </p>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeeCollection;
