import { useSelector } from "react-redux";
import { Users, BookOpen, IndianRupee, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="bg-[#f8ede3] rounded-2xl border border-[#e6c8a8] px-3 py-3 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 shadow-sm"
    >
        <div
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: color + "22" }}
        >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
        </div>
        <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-semibold text-[#b0998a] uppercase tracking-wider">{label}</p>
            <p className="text-base sm:text-xl font-bold text-[#2c1a0e] leading-tight">{value}</p>
            {sub && <p className="text-[10px] sm:text-xs text-[#7b5c4b] mt-0.5 truncate">{sub}</p>}
        </div>
    </motion.div>
);

const StatsStrip = () => {
    const batches = useSelector(s => s.batches);
    const feeSummary = useSelector(s => s.feeSummary);
    const attendance = useSelector(s => s.attendance);

    const globalStats = feeSummary?.globalStats;
    const collectedAmt = globalStats?.totalPaidAmount ?? 0;
    const totalAmt = globalStats?.totalInstituteFees ?? 0;
    const totalStudents = globalStats?.studentsCount ?? 0;
    const activeBatches = batches.length;
    const fmt = n => new Intl.NumberFormat("en-IN").format(n);

    const attStudents = attendance?.data || [];
    const avgAtt = attStudents.length > 0
        ? attStudents.reduce((sum, s) => {
            const subAvg = s.subjects.length > 0
                ? s.subjects.reduce((a, b) => a + b.percentage, 0) / s.subjects.length
                : 0;
            return sum + subAvg;
        }, 0) / attStudents.length
        : null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
                icon={Users}
                label="Total Students"
                value={totalStudents}
                sub={`across ${activeBatches} batch${activeBatches !== 1 ? "es" : ""}`}
                color="#8b5e3c"
                delay={0}
            />
            <StatCard
                icon={BookOpen}
                label="Active Batches"
                value={activeBatches}
                sub="running this month"
                color="#c47d3e"
                delay={0.07}
            />
            <StatCard
                icon={IndianRupee}
                label="Collected This Month"
                value={`₹${fmt(collectedAmt)}`}
                sub={`of ₹${fmt(totalAmt)} total`}
                color="#4a7c59"
                delay={0.14}
            />
            <StatCard
                icon={TrendingUp}
                label="Avg Attendance"
                value={avgAtt !== null ? `${avgAtt.toFixed(1)}%` : "—"}
                sub={avgAtt !== null ? "across all students" : "loading…"}
                color="#3a6db5"
                delay={0.21}
            />
        </div>
    );
};

export default StatsStrip;
