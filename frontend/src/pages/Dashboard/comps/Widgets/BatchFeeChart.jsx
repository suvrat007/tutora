import { useSelector } from "react-redux";
import { LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

const barColor = pct => pct >= 75 ? "#4a7c59" : pct >= 40 ? "#c47d3e" : "#b94444";

const BatchFeeChart = () => {
    const batchWise = useSelector(s => s.feeSummary?.batchWise ?? []);

    const batchData = batchWise
        .filter(b => b.totalFees > 0)
        .map(b => ({
            ...b,
            pct: (b.paidAmount / b.totalFees) * 100,
        }));

    const fmt = n => new Intl.NumberFormat("en-IN").format(n);

    return (
        <div className="bg-[#f8ede3] rounded-3xl border border-[#e6c8a8] shadow-xl p-4 sm:p-6 h-full flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold text-[#5a4a3c] border-b border-[#e6c8a8] pb-2.5 mb-4 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#c47d3e]" />
                Batch-wise Fee Breakdown
            </h2>

            {batchData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[#7b5c4b] text-sm">
                    No batch fee data available.
                </div>
            ) : (
                <div className="sm:flex-1 overflow-y-auto space-y-4 pr-1">
                    {batchData.map((b, i) => (
                        <motion.div
                            key={b.batchId || b.batchName + i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                        >
                            <div className="flex justify-between items-baseline mb-1.5 gap-2">
                                <div className="min-w-0">
                                    <span className="text-sm font-semibold text-[#2c1a0e] truncate block">
                                        {b.batchName}
                                        {b.forStandard && (
                                            <span className="ml-1.5 text-xs font-normal text-[#b0998a]">
                                                Class {b.forStandard}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="text-xs font-bold text-[#8b5e3c]">₹{fmt(b.paidAmount)}</span>
                                    <span className="text-[10px] text-[#b0998a]"> / ₹{fmt(b.totalFees)}</span>
                                </div>
                            </div>
                            <div className="h-2.5 bg-[#e6c8a8] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${b.pct}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                                    className="h-full rounded-full"
                                    style={{ background: barColor(b.pct) }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-[#b0998a] mt-1">
                                <span>{b.studentsCount} student{b.studentsCount !== 1 ? "s" : ""}</span>
                                <span className="font-semibold">{b.pct.toFixed(0)}% collected</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BatchFeeChart;
