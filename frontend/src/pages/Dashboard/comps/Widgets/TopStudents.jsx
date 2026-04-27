import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Trophy, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { TEST_STATUS } from "@/utilities/constants";

const MEDALS = [
    { label: "1st", bg: "#FFD70030", color: "#C8A800", border: "#FFD70060" },
    { label: "2nd", bg: "#C0C0C030", color: "#808080", border: "#C0C0C060" },
    { label: "3rd", bg: "#CD7F3230", color: "#A05A20", border: "#CD7F3260" },
];

const PctBar = ({ value }) => (
    <div className="h-1.5 bg-[#e6c8a8] rounded-full overflow-hidden mt-1">
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #8b5e3c, #c47d3e)" }}
        />
    </div>
);

// Composite = 40% attendance + 40% marks + 20% fee
// If no test data: redistribute proportionally → 66.7% attendance + 33.3% fee
const computeComposite = (attendancePct, marksPct, feePct) => {
    if (marksPct === null) {
        return attendancePct * 0.667 + feePct * 0.333;
    }
    return attendancePct * 0.40 + marksPct * 0.40 + feePct * 0.20;
};

const TopStudents = () => {
    const attendance = useSelector(s => s.attendance);
    const batches = useSelector(s => s.batches);
    const tests = useSelector(s => s.tests?.tests || []);
    const feeSummary = useSelector(s => s.feeSummary);
    const [selectedBatch, setSelectedBatch] = useState("all");

    const allStudents = attendance?.data || [];
    const pendingStudents = feeSummary?.pendingStudents || [];

    // Build per-student marks score from completed tests
    const marksMap = useMemo(() => {
        const map = {};
        tests
            .filter(t => t.status === TEST_STATUS.COMPLETED && t.maxMarks > 0)
            .forEach(t => {
                (t.studentResults || []).forEach(r => {
                    if (!r.appeared) return;
                    const sid = String(r.studentId?._id || r.studentId);
                    if (!map[sid]) map[sid] = { totalObtained: 0, totalMax: 0 };
                    map[sid].totalObtained += r.marks || 0;
                    map[sid].totalMax += t.maxMarks;
                });
            });
        return map;
    }, [tests]);

    // Build set of unpaid student IDs
    const unpaidIds = useMemo(
        () => new Set(pendingStudents.map(p => String(p.studentId))),
        [pendingStudents]
    );

    const ranked = useMemo(() => {
        return allStudents
            .map(s => {
                const subs = selectedBatch === "all"
                    ? s.subjects
                    : s.subjects.filter(sub => String(sub.batchId) === String(selectedBatch));
                if (!subs || subs.length === 0) return null;

                const attendancePct = subs.reduce((sum, sub) => sum + sub.percentage, 0) / subs.length;
                const totalAttended = subs.reduce((sum, sub) => sum + sub.attended, 0);
                const totalClasses = subs.reduce((sum, sub) => sum + sub.total, 0);

                const sid = String(s.studentId);
                const marksData = marksMap[sid];
                const marksPct = marksData && marksData.totalMax > 0
                    ? (marksData.totalObtained / marksData.totalMax) * 100
                    : null;

                const feePct = unpaidIds.has(sid) ? 0 : 100;
                const composite = computeComposite(attendancePct, marksPct, feePct);

                const batch = batches.find(b => String(b._id) === String(subs[0].batchId));
                return {
                    studentId: sid,
                    name: s.studentName,
                    composite,
                    attendancePct,
                    marksPct,
                    feePaid: !unpaidIds.has(sid),
                    totalAttended,
                    totalClasses,
                    batchName: batch?.name || "Unknown",
                    forStandard: batch?.forStandard || "",
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.composite - a.composite)
            .slice(0, 3);
    }, [allStudents, selectedBatch, batches, marksMap, unpaidIds]);

    return (
        <div className="bg-[#f8ede3] rounded-3xl border border-[#e6c8a8] shadow-xl p-4 sm:p-6 sm:h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e6c8a8] pb-2.5 mb-4">
                <h2 className="text-lg font-semibold text-[#5a4a3c] flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#c47d3e]" />
                    Top Students
                </h2>
                <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#b0998a]" />
                    <select
                        value={selectedBatch}
                        onChange={e => setSelectedBatch(e.target.value)}
                        className="bg-white border border-[#e6c8a8] rounded-lg px-2.5 py-1.5 text-xs text-[#2c1a0e] focus:outline-none focus:ring-2 focus:ring-[#c47d3e]/30 cursor-pointer"
                    >
                        <option value="all">All Batches</option>
                        {batches.map(b => (
                            <option key={b._id} value={b._id}>
                                {b.name}{b.forStandard ? ` (Class ${b.forStandard})` : ""}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="sm:flex-1 space-y-3 overflow-y-auto pr-1">
                {allStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-[#7b5c4b]">
                        <Trophy className="w-9 h-9 text-[#e0c4a8]" />
                        <p className="text-sm font-medium">No data yet.</p>
                        <p className="text-xs text-[#b0998a]">Start logging classes to see rankings.</p>
                    </div>
                ) : ranked.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-[#7b5c4b]">
                        <p className="text-sm font-medium">No students in this batch.</p>
                    </div>
                ) : (
                    ranked.map((s, i) => (
                        <motion.div
                            key={s.studentId}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.4 }}
                            className="flex items-center gap-4 bg-white border border-[#e6c8a8] rounded-2xl px-4 py-3 shadow-sm"
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                    background: MEDALS[i].bg,
                                    color: MEDALS[i].color,
                                    border: `2px solid ${MEDALS[i].border}`,
                                }}
                            >
                                {MEDALS[i].label}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#2c1a0e] truncate">{s.name}</p>
                                <p className="text-xs text-[#b0998a] truncate">
                                    {s.batchName}{s.forStandard ? ` · Class ${s.forStandard}` : ""}
                                </p>
                                <PctBar value={s.composite} />
                                <div className="flex gap-2 mt-1 text-[10px] text-[#b0998a]">
                                    <span title="Attendance">A: {s.attendancePct.toFixed(0)}%</span>
                                    <span className="opacity-40">·</span>
                                    <span title="Test marks">{s.marksPct !== null ? `M: ${s.marksPct.toFixed(0)}%` : "M: —"}</span>
                                    <span className="opacity-40">·</span>
                                    <span title="Fee status" className={s.feePaid ? "text-green-600" : "text-red-500"}>
                                        F: {s.feePaid ? "✓" : "✗"}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-base font-bold text-[#8b5e3c]">{s.composite.toFixed(1)}%</p>
                                <p className="text-[10px] text-[#b0998a]">composite</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TopStudents;
