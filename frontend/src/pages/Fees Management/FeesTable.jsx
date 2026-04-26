import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
    Users,
    Building2,
    BookOpen,
    CheckCircle,
    XCircle,
    Download,
    Loader2,
} from "lucide-react";
import WrapperCard from "@/utilities/WrapperCard.jsx";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";
import { exportToCSV } from "@/utilities/csvExport.js";
import { formatDate } from "@/utilities/dateUtils";

const FeesTable = ({ monthFilter, setMonthFilter, onSaveComplete }) => {
    const batchesMetadata = useSelector(state => state.batches) || [];

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [batchFilter, setBatchFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [paidFilter, setPaidFilter] = useState("");

    // Debounced auto-save state
    const [pendingChanges, setPendingChanges] = useState({});
    const [dirtyCount, setDirtyCount] = useState(0);
    const saveTimeoutRef = useRef(null);
    const saveCtxRef = useRef({});
    const studentsRef = useRef([]);

    const currentMonth = `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`;

    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchFeesList = useCallback(async () => {
        if (!isMounted.current) return;
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                month: monthFilter === "Present Month" ? currentMonth : monthFilter,
            });
            if (batchFilter) queryParams.append("batchId", batchFilter);
            if (subjectFilter) queryParams.append("subject", subjectFilter);
            if (paidFilter) queryParams.append("status", paidFilter);

            const res = await axiosInstance.get(`student/fees/list?${queryParams.toString()}`);
            if (isMounted.current) {
                setStudents(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
                setPendingChanges({});
            }
        } catch (error) {
            console.error("Failed to fetch students fee list", error);
            if (isMounted.current) toast.error("Failed to load fee data");
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [page, batchFilter, subjectFilter, paidFilter, monthFilter, currentMonth]);

    // Keep refs current on every render so callbacks always read fresh values
    studentsRef.current = students;
    saveCtxRef.current = { pendingChanges, monthFilter, fetchFeesList, onSaveComplete };

    // Debounced fetch on filter/page change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchFeesList();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchFeesList]);

    // Toggle paid status with optimistic update
    const togglePaidStatus = useCallback((studentId) => {
        const idStr = studentId.toString();
        const student = studentsRef.current.find(s => s.studentId.toString() === idStr);
        if (!student) return;
        const newPaid = !student.isPaidThisMonth;
        console.log("[FeeToggle] toggling", idStr, "→", newPaid);
        setStudents(prev => prev.map(s =>
            s.studentId.toString() === idStr ? { ...s, isPaidThisMonth: newPaid } : s
        ));
        setPendingChanges(changes => ({ ...changes, [idStr]: newPaid }));
        setDirtyCount(c => c + 1);
    }, []);

    // Debounced auto-save whenever dirtyCount increments
    useEffect(() => {
        if (!dirtyCount) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setSaving(true);
        saveTimeoutRef.current = setTimeout(async () => {
            const { pendingChanges: changes, monthFilter: mf, fetchFeesList: refetch, onSaveComplete: notifyParent } = saveCtxRef.current;
            console.log("[FeeToggle] save timeout fired, changes:", changes, "month:", mf);
            try {
                // Force UTC so "April 1" doesn't become March 31 18:30Z for IST users
                const dateStr = mf === "Present Month" || !mf
                    ? new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), 1)).toISOString()
                    : new Date(`${mf.split(" ")[0]} 1, ${mf.split(" ")[1]} UTC`).toISOString();

                const entries = Object.entries(changes);
                if (!entries.length) { console.warn("[FeeToggle] no changes to save"); return; }
                const paidIds = entries.filter(([, v]) => v).map(([id]) => id);
                const unpaidIds = entries.filter(([, v]) => !v).map(([id]) => id);
                console.log("[FeeToggle] POSTing — paid:", paidIds, "unpaid:", unpaidIds, "date:", dateStr);

                await Promise.all([
                    ...(paidIds.length ? [axiosInstance.post("student/bulk-update-fee-status", { studentIds: paidIds, paid: true, date: dateStr })] : []),
                    ...(unpaidIds.length ? [axiosInstance.post("student/bulk-update-fee-status", { studentIds: unpaidIds, paid: false, date: dateStr })] : []),
                ]);
                console.log("[FeeToggle] save succeeded");

                if (isMounted.current) {
                    setPendingChanges({});
                    notifyParent?.();
                }
            } catch (error) {
                console.error("[FeeToggle] save failed:", error.response?.data || error.message);
                if (isMounted.current) {
                    toast.error("Failed to save fee status");
                    refetch();
                }
            } finally {
                if (isMounted.current) setSaving(false);
            }
        }, 800);
        return () => clearTimeout(saveTimeoutRef.current);
    }, [dirtyCount]);

    const handleExportCSV = () => {
        if (!students.length) { toast("No data to export."); return; }
        const activeMonth = monthFilter === "Present Month" ? currentMonth : monthFilter;
        const rows = students.map(s => ({
            Name: s.name,
            Batch: s.batchName,
            Subjects: s.subjects?.join(" | ") || "",
            "Amount (₹)": s.amount,
            Status: s.isPaidThisMonth ? "Paid" : "Due",
            "Paid On": s.paidAt ? formatDate(s.paidAt) : "",
            Month: activeMonth,
        }));
        exportToCSV(rows, `fees_${activeMonth.replace(" ", "_")}.csv`);
    };

    const availableSubjects = [...new Set(batchesMetadata.flatMap(b => (b.subject || []).map(s => s.name)))];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
        >
            <WrapperCard>
                <div className="bg-[#f8ede3] rounded-3xl h-[85vh] overflow-hidden flex flex-col relative">
                    {loading && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden z-50">
                            <div className="h-full bg-[#e0c4a8] animate-pulse w-full"></div>
                        </div>
                    )}

                    <div className="px-6 py-4 bg-[#f0d9c0] border-b border-[#e6c8a8]">
                        <div className="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-2 w-full">
                            <div className="flex flex-col items-center sm:items-start justify-center w-full sm:w-auto">
                                <h2 className="text-xl font-semibold text-[#5a4a3c] flex items-center gap-2 text-center sm:text-left">
                                    <Users className="w-5 h-5 text-[#5a4a3c]" />
                                    Student Fee Details
                                </h2>
                                <p className="text-sm text-[#7b5c4b] text-center sm:text-left">
                                    Click a status badge to toggle paid / due
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {saving && (
                                    <span className="text-xs text-[#8b5e3c] flex items-center gap-1 animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving
                                    </span>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportCSV}
                                    className="px-4 py-2 bg-[#e0c4a8] text-[#5a4a3c] rounded-lg hover:bg-[#d8bca0] transition-all duration-300 shadow-sm font-medium flex items-center gap-1.5"
                                >
                                    <Download className="w-4 h-4" /> Export CSV
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 p-4 bg-[#f8ede3] border-b border-[#e6c8a8] z-20">
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Batch</label>
                            <select
                                value={batchFilter}
                                onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
                                className="w-full p-2.5 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-white shadow-sm focus:ring-2 focus:ring-[#e0c4a8] focus:border-[#e0c4a8] outline-none transition-shadow"
                            >
                                <option value="">All Batches</option>
                                {batchesMetadata.map((batch) => (
                                    <option key={batch._id} value={batch._id}>
                                        {batch.name} {batch.forStandard ? `(Class ${batch.forStandard})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Subject</label>
                            <select
                                value={subjectFilter}
                                onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
                                className="w-full p-2.5 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-white shadow-sm focus:ring-2 focus:ring-[#e0c4a8] focus:border-[#e0c4a8] outline-none transition-shadow"
                            >
                                <option value="">All Subjects</option>
                                {availableSubjects.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Status</label>
                            <select
                                value={paidFilter}
                                onChange={(e) => { setPaidFilter(e.target.value); setPage(1); }}
                                className="w-full p-2.5 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-white shadow-sm focus:ring-2 focus:ring-[#e0c4a8] focus:border-[#e0c4a8] outline-none transition-shadow"
                            >
                                <option value="">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Target Month</label>
                            <select
                                value={monthFilter}
                                onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
                                className="w-full p-2.5 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-white shadow-sm focus:ring-2 focus:ring-[#e0c4a8] focus:border-[#e0c4a8] outline-none transition-shadow"
                            >
                                {[...Array(6)].map((_, i) => {
                                    const d = new Date();
                                    d.setMonth(d.getMonth() - i);
                                    const mStr = `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
                                    return <option key={mStr} value={mStr}>{mStr}</option>;
                                })}
                            </select>
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                        <table className="min-w-full divide-y divide-[#e6c8a8]">
                            <thead className="bg-[#f0d9c0] sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Batch</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Subjects</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#f0d9c0] text-sm text-[#5a4a3c]">
                                {students.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-24 text-center text-[#7b5c4b]">
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-[#f8ede3] rounded-full flex justify-center items-center">
                                                    <Users className="w-8 h-8 text-[#e0c4a8]" />
                                                </div>
                                                <p className="font-medium text-lg">No students found</p>
                                                <p className="text-sm">Adjust filters or change the target month to see results.</p>
                                            </motion.div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => {
                                        const isPending = student.studentId.toString() in pendingChanges;
                                        return (
                                            <motion.tr
                                                key={student.studentId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-[#fcf8f5] transition-colors duration-200"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e0c4a8] to-[#d0b498] shadow-inner flex items-center justify-center text-sm font-bold text-white">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-gray-800">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-[#a08a78]" />
                                                        <span className="font-medium text-gray-700">{student.batchName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-[#a08a78]" />
                                                        <span className="text-gray-600">{student.subjects?.join(", ") || "No Subjects"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-800">₹{student.amount.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => togglePaidStatus(student.studentId)}
                                                        disabled={saving}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border shadow-sm transition-all duration-200 cursor-pointer hover:opacity-80 active:scale-95 disabled:cursor-not-allowed ${
                                                            student.isPaidThisMonth
                                                                ? "bg-green-50 text-green-700 border-green-200"
                                                                : "bg-red-50 text-red-700 border-red-200"
                                                        } ${isPending ? "ring-2 ring-[#e0c4a8] ring-offset-1" : ""}`}
                                                    >
                                                        {student.isPaidThisMonth
                                                            ? <CheckCircle className="w-4 h-4 text-green-600" />
                                                            : <XCircle className="w-4 h-4 text-red-500" />
                                                        }
                                                        {student.isPaidThisMonth ? "Paid" : "Due"}
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="bg-[#f0d9c0] px-6 py-3 border-t border-[#e6c8a8] flex items-center justify-between">
                            <span className="text-sm font-medium text-[#7b5c4b]">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="px-3 py-1.5 bg-[#f8ede3] border border-[#e0c4a8] rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-[#5a4a3c]"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="px-3 py-1.5 bg-[#f8ede3] border border-[#e0c4a8] rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors text-[#5a4a3c]"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </WrapperCard>
        </motion.div>
    );
};

export default FeesTable;
