import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Building2,
    BookOpen,
    CheckCircle,
    XCircle,
    Calendar,
} from "lucide-react";
import WrapperCard from "@/utilities/WrapperCard.jsx";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { useState } from "react";

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

const FeesTable = ({ batches, students, fetchStudents, monthFilter, setMonthFilter }) => {
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [batchFilter, setBatchFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [paidFilter, setPaidFilter] = useState("");

    // Extract unique months from feeStatus arrays
    const availableMonths = [
        ...new Set(
            students
                .flatMap((student) => student.feeStatus || [])
                .filter((status) => status && status.date)
                .map((status) => {
                    const date = new Date(status.date);
                    return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
                })
        ),
    ].sort((a, b) => {
        const [monthA, yearA] = a.split(" ");
        const [monthB, yearB] = b.split(" ");
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateB - dateA; // Sort in descending order (most recent first)
    });

    const availableSubjects = batchFilter
        ? [...(batches.find((batch) => batch.batchId === batchFilter)?.students || [])
            .flatMap((student) => student.subjects || [])
            .filter((subject) => subject && subject !== "Unknown Subject")
            .filter((subject, index, array) => array.indexOf(subject) === index)]
            .sort()
        : [...students
            .flatMap((student) => student.subjects || [])
            .filter((subject) => subject && subject !== "Unknown Subject")
            .filter((subject, index, array) => array.indexOf(subject) === index)]
            .sort();

    // Get fee status for the selected month
    const getMonthStatus = (feeStatus, month) => {
        if (!month) return { isPaid: false, date: null };
        const status = (feeStatus || []).find((s) => {
            const date = new Date(s.date);
            const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
            return monthYear === month;
        });
        return status ? { isPaid: status.paid, date: new Date(status.date) } : { isPaid: false, date: null };
    };

    const filteredStudents = students.filter((student) => {
        const matchesBatch = batchFilter ? student.batchId === batchFilter : true;
        const matchesSubject = subjectFilter
            ? (student.subjects || []).includes(subjectFilter)
            : true;
        const matchesPaid = paidFilter
            ? paidFilter === "paid"
                ? getMonthStatus(student.feeStatus, monthFilter).isPaid
                : !getMonthStatus(student.feeStatus, monthFilter).isPaid
            : true;
        const matchesMonth = monthFilter
            ? (student.feeStatus || []).some((status) => {
                const date = new Date(status.date);
                const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
                return monthYear === monthFilter;
            })
            : true;

        return matchesBatch && matchesSubject && matchesPaid && matchesMonth;
    });

    const handleCheckboxChange = (studentId) => {
        setSelectedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleMarkSelectedPaid = async () => {
        if (selectedStudentIds.length === 0) {
            alert("Please select at least one student.");
            return;
        }

        try {
            await axiosInstance.post(
                "/api/student/bulk-update-fee-status",
                {
                    studentIds: selectedStudentIds,
                    paid: true,
                    date: monthFilter
                        ? new Date(
                            `${monthFilter.split(" ")[0]} 1, ${monthFilter.split(" ")[1]}`
                        ).toISOString()
                        : new Date().toISOString(),
                },
                { withCredentials: true }
            );
            alert("Fee status updated successfully!");
            setSelectedStudentIds([]);
            setShowCheckboxes(false);
            await fetchStudents();
        } catch (error) {
            console.error("Error updating fee statuses:", error.message);
            alert("Failed to update fee statuses. Please try again.");
        }
    };

    const getStatusColor = (isPaid) => {
        return isPaid
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200";
    };

    const getStatusIcon = (isPaid) => {
        return isPaid ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
            <XCircle className="w-4 h-4 text-red-500" />
        );
    };

    const getLastPaidDate = (feeStatus) => {
        if (!feeStatus || feeStatus.length === 0) return null;
        const paidStatus = [...feeStatus]
            .filter((status) => status.paid)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return paidStatus ? new Date(paidStatus.date) : null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
        >
            <WrapperCard>
                <div className="bg-[#f8ede3] rounded-3xl h-[80vh] overflow-hidden flex flex-col">
                    <div className="px-6 py-4 bg-[#f0d9c0] border-b border-[#e6c8a8]">
                        <div className="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-2 w-full">
                            <div className="flex flex-col items-center sm:items-start justify-center w-full">
                                <h2 className="text-xl font-semibold text-[#5a4a3c] flex items-center gap-2 text-center sm:text-left">
                                    <Users className="w-5 h-5 text-[#5a4a3c]" />
                                    Student Fee Details
                                </h2>
                                <p className="text-sm text-[#7b5c4b] text-center sm:text-left">
                                    Manage and track student fee payments
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowCheckboxes((prev) => !prev)}
                                    className="px-4 py-2 bg-[#e0c4a8] text-[#5a4a3c] rounded-lg hover:bg-[#d8bca0] transition-all duration-300 shadow-md"
                                >
                                    {showCheckboxes ? "Cancel" : "Mark as Paid"}
                                </motion.button>
                                {showCheckboxes && (
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleMarkSelectedPaid}
                                        className="px-4 py-2 bg-[#34C759] text-white rounded-lg hover:bg-[#2eb84c] transition-all duration-300 disabled:bg-gray-400 shadow-md"
                                        disabled={selectedStudentIds.length === 0}
                                    >
                                        Confirm Paid ({selectedStudentIds.length})
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 p-4 bg-[#f8ede3] border-b border-[#e6c8a8]">
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-medium text-[#7b5c4b] uppercase mb-1">Batch</label>
                            <select
                                value={batchFilter}
                                onChange={(e) => {
                                    setBatchFilter(e.target.value);
                                    setSubjectFilter("");
                                }}
                                className="w-full p-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-[#f8ede3] focus:ring-[#e0c4a8] focus:border-[#e6c8a8]"
                            >
                                <option value="">All Batches</option>
                                {batches.map((batch) => (
                                    <option key={batch.batchId} value={batch.batchId}>
                                        {batch.batchName} (Class {batch.forStandard})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-medium text-[#7b5c4b] uppercase mb-1">Subject</label>
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="w-full p-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-[#f8ede3] focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
                                disabled={availableSubjects.length === 0}
                            >
                                <option value="">All Subjects</option>
                                {availableSubjects.map((subject) => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-medium text-[#7b5c4b] uppercase mb-1">Status</label>
                            <select
                                value={paidFilter}
                                onChange={(e) => setPaidFilter(e.target.value)}
                                className="w-full p-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-[#f8ede3] focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
                            >
                                <option value="">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-medium text-[#7b5c4b] uppercase mb-1">Month</label>
                            <select
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                className="w-full p-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-[#f8ede3] focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
                                disabled={availableMonths.length === 0}
                            >
                                <option value="">Present Month</option>
                                {availableMonths.map((month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full divide-y divide-[#e6c8a8]">
                            <thead className="bg-[#f8ede3] sticky top-0 z-10">
                            <tr>
                                {showCheckboxes && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#7b5c4b] uppercase">
                                        <input
                                            type="checkbox"
                                            onChange={(e) =>
                                                setSelectedStudentIds(
                                                    e.target.checked
                                                        ? filteredStudents.map((s) => s.studentId)
                                                        : []
                                                )
                                            }
                                            checked={
                                                selectedStudentIds.length === filteredStudents.length &&
                                                filteredStudents.length > 0
                                            }
                                            className="rounded border-[#e6c8a8]"
                                        />
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#7b5c4b] uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#7b5c4b] uppercase">Batch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#7b5c4b] uppercase">Subjects</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#7b5c4b] uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#7b5c4b] uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#7b5c4b] uppercase">Updates</th>
                            </tr>
                            </thead>
                            <tbody className="bg-[#f8ede3] divide-y divide-[#e6c8a8] text-sm text-[#5a4a3c]">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={showCheckboxes ? "7" : "6"}
                                        className="px-6 py-12 text-center text-[#7b5c4b]"
                                    >
                                        <motion.div
                                            variants={placeholderVariants}
                                            animate="pulse"
                                            className="flex flex-col items-center gap-2"
                                        >
                                            <Users className="w-10 h-10 text-[#e0c4a8]" />
                                            <p className="font-medium">No students found</p>
                                            <p className="text-xs">Adjust filters to see results</p>
                                        </motion.div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filteredStudents.map((student, index) => {
                                        const monthStatus = getMonthStatus(student.feeStatus, monthFilter);
                                        return (
                                            <motion.tr
                                                key={student.studentId}
                                                variants={fadeInUp}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                className="hover:bg-[#f0d9c0] transition-all duration-300"
                                            >
                                                {showCheckboxes && (
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudentIds.includes(student.studentId)}
                                                            onChange={() => handleCheckboxChange(student.studentId)}
                                                            className="rounded border-[#e6c8a8]"
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#e0c4a8] flex items-center justify-center text-xs font-semibold text-[#5a4a3c]">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-[#5a4a3c]">{student.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-[#7b5c4b]" />
                                                        <span>{student.batchName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-[#7b5c4b]" />
                                                        <span>{student.subjects.join(", ") || "No Subjects"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">₹{student.amount.toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                            monthStatus.isPaid
                                                        )}`}
                                                    >
                                                        {getStatusIcon(monthStatus.isPaid)}
                                                        {monthStatus.isPaid ? "Paid" : "Unpaid"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.feeStatus && student.feeStatus.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {[...student.feeStatus]
                                                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                                .slice(0, 2)
                                                                .map((status, index) => (
                                                                    <div key={index} className="flex items-center gap-2 text-xs">
                                                                        <Calendar className="w-3 h-3 text-[#7b5c4b]" />
                                                                        <span className="text-[#7b5c4b]">
                                                                            {status.paid
                                                                                ? `Paid on ${new Date(status.date).toLocaleDateString()}`
                                                                                : `Last paid on ${
                                                                                    getLastPaidDate(student.feeStatus)?.toLocaleDateString() ||
                                                                                    "No payment history"
                                                                                }`}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#7b5c4b] text-xs">No payment history</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </WrapperCard>
        </motion.div>
    );
};

export default FeesTable;