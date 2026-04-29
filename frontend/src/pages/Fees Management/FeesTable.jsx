import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Building2,
    BookOpen,
    CheckCircle,
    XCircle,
    Download,
    Loader2,
    ChevronDown,
} from "lucide-react";
import WrapperCard from "@/components/ui/WrapperCard.jsx";
import Dropdown from "@/components/ui/Dropdown";
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
    const dropdownRef = useRef(null);
    const checkNoStudentsRef = useRef(false);
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

    useEffect(() => {
        isMounted.current = true;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMonthDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => { 
            isMounted.current = false; 
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleMonthSelect = (mStr) => {
        setMonthFilter(mStr);
        setPage(1);
        setIsMonthDropdownOpen(false);
        checkNoStudentsRef.current = true;
    };

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

                if (checkNoStudentsRef.current) {
                    if (res.data.data.length === 0) {
                        toast("There were no students enrolled on this month", { 
                            icon: "ℹ️", 
                            style: { background: '#f8ede3', color: '#5a4a3c', border: '1px solid #e6c8a8' } 
                        });
                    }
                    checkNoStudentsRef.current = false;
                }
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
        
        if (activeMonth.startsWith("Whole Year")) {
            const year = activeMonth.split(" ")[2];
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
            const rows = students.map(s => {
                const row = {
                    Name: s.name,
                    Batch: s.batchName,
                    Subjects: s.subjects?.join(" | ") || "",
                    "Monthly Amount (₹)": s.amount,
                };
                
                months.forEach((m, index) => {
                    const mStatus = (s.yearlyFeeStatuses || []).find(fs => new Date(fs.date).getMonth() === index);
                    if (mStatus) {
                        row[m] = mStatus.paid ? `Paid (${formatDate(mStatus.paid_at || mStatus.date)})` : "Due";
                    } else {
                        row[m] = "-";
                    }
                });
                return row;
            });
            exportToCSV(rows, `fees_yearly_summary_${year}.csv`);
        } else {
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
        }
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
                            <Dropdown
                                value={batchFilter}
                                onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
                                options={[
                                    { label: 'All Batches', value: '' },
                                    ...batchesMetadata.map(b => ({
                                        label: `${b.name} ${b.forStandard ? `(Class ${b.forStandard})` : ''}`,
                                        value: b._id
                                    }))
                                ]}
                            />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Subject</label>
                            <Dropdown
                                value={subjectFilter}
                                onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
                                options={[
                                    { label: 'All Subjects', value: '' },
                                    ...availableSubjects.map(s => ({ label: s, value: s }))
                                ]}
                            />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Status</label>
                            <Dropdown
                                value={paidFilter}
                                onChange={(e) => { setPaidFilter(e.target.value); setPage(1); }}
                                options={[
                                    { label: 'All Statuses', value: '' },
                                    { label: 'Paid', value: 'paid' },
                                    { label: 'Unpaid', value: 'unpaid' }
                                ]}
                            />
                        </div>
                        <div className="flex-1 min-w-[120px] relative" ref={dropdownRef}>
                            <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Target Month</label>
                            <button
                                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                                className="w-full p-2.5 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-white shadow-sm hover:border-[#e0c4a8] outline-none transition-shadow text-left flex justify-between items-center"
                            >
                                <span>{monthFilter}</span>
                                <ChevronDown className="w-4 h-4 text-[#a08a78]" />
                            </button>
                            
                            <AnimatePresence>
                                {isMonthDropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full right-0 sm:left-0 mt-2 p-3 bg-white border border-[#e6c8a8] shadow-lg rounded-xl z-50 w-[280px]"
                                    >
                                        <div className="grid grid-cols-3 gap-2">
                                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => {
                                                const mStr = `${m} ${new Date().getFullYear()}`;
                                                const isSelected = monthFilter === mStr || (monthFilter === "Present Month" && currentMonth === mStr);
                                                return (
                                                    <button
                                                        key={m}
                                                        onClick={() => handleMonthSelect(mStr)}
                                                        className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                                                            isSelected 
                                                                ? "bg-[#e0c4a8] border-[#cda886] text-[#5a4a3c] shadow-sm" 
                                                                : "bg-[#fdfaf7] border-[#f0d9c0] text-[#7b5c4b] hover:bg-[#f0e8df] hover:border-[#e0c4a8]"
                                                        }`}
                                                    >
                                                        {m.slice(0, 3)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-[#f0d9c0]">
                                            <button
                                                onClick={() => handleMonthSelect(`Whole Year ${new Date().getFullYear()}`)}
                                                className={`w-full py-2 text-xs font-bold rounded-lg border transition-colors ${
                                                    monthFilter.startsWith("Whole Year")
                                                        ? "bg-[#e0c4a8] border-[#cda886] text-[#5a4a3c] shadow-sm" 
                                                        : "bg-[#fdfaf7] border-[#f0d9c0] text-[#7b5c4b] hover:bg-[#f0e8df] hover:border-[#e0c4a8]"
                                                }`}
                                            >
                                                Whole Year {new Date().getFullYear()} Summary
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                                    {monthFilter.startsWith("Whole Year") ? (() => {
                                                        const unpaidStatuses = (student.yearlyFeeStatuses || []).filter(fs => !fs.paid);
                                                        const paidCount = (student.yearlyFeeStatuses || []).filter(fs => fs.paid).length;
                                                        const totalCount = (student.yearlyFeeStatuses || []).length;
                                                        
                                                        if (totalCount === 0) {
                                                            return <span className="text-xs text-gray-500 font-medium">No Data</span>;
                                                        }
                                                        
                                                        if (unpaidStatuses.length === 0) {
                                                            return (
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-200 w-fit">
                                                                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> All Paid ({totalCount}/{totalCount})
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        const dueMonths = unpaidStatuses.map(fs => new Date(fs.date).toLocaleString('default', { month: 'short' })).join(', ');
                                                        return (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200 w-fit">
                                                                    <XCircle className="w-3.5 h-3.5 text-red-500" /> Due: {dueMonths}
                                                                </span>
                                                                <span className="text-[10px] text-gray-500 font-medium ml-1">
                                                                    Paid {paidCount} of {totalCount} months
                                                                </span>
                                                            </div>
                                                        );
                                                    })() : (
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
                                                    )}
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
