import { useState } from "react";
import { motion } from 'framer-motion';
import {
    DollarSign, Users, BookOpen, CheckCircle, XCircle,
    Calendar, Building2
} from 'lucide-react';
import WrapperCard from "@/utilities/WrapperCard.jsx";
import axiosInstance from "@/utilities/axiosInstance.jsx";

const FeesTable = ({ batches, students, fetchStudents }) => {
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [batchFilter, setBatchFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [paidFilter, setPaidFilter] = useState("");

    const availableSubjects = batchFilter
        ? (batches.find((batch) => batch.batchId === batchFilter)?.students || [])
            .flatMap((student) => student.subjects || [])
            .filter((subject) => subject && subject !== "Unknown Subject")
            .filter((subject, index, array) => array.indexOf(subject) === index) // Remove duplicates
            .sort()
        : students
            .flatMap((student) => student.subjects || [])
            .filter((subject) => subject && subject !== "Unknown Subject")
            .filter((subject, index, array) => array.indexOf(subject) === index) // Remove duplicates
            .sort();

    const filteredStudents = students.filter((student) => {
        const matchesBatch = batchFilter ? student.batchId === batchFilter : true;
        const matchesSubject = subjectFilter
            ? student.subjects && student.subjects.includes(subjectFilter)
            : true;
        const matchesPaid = paidFilter
            ? paidFilter === "paid"
                ? student.isPaidThisMonth
                : !student.isPaidThisMonth
            : true;

        return matchesBatch && matchesSubject && matchesPaid;
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
                    date: new Date().toISOString()
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
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200';
    };

    const getStatusIcon = (isPaid) => {
        return isPaid
            ? <CheckCircle className="w-4 h-4 text-green-600" />
            : <XCircle className="w-4 h-4 text-red-500" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
        >
            <WrapperCard>
                <div className="bg-[#fff] rounded-xl h-[600px] overflow-hidden flex flex-col">
                    <div className="px-6 py-4 bg-[#f5e8dc] border-b border-[#e7c6a5]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-[#4a3a2c] flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Student Fee Details
                                </h2>
                                <p className="text-sm text-[#9b8778]">Manage and track student fee payments</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowCheckboxes((prev) => !prev)}
                                    className="px-4 py-2 bg-[#4a3a2c] text-white rounded-lg hover:bg-[#2f231a] transition-colors"
                                >
                                    {showCheckboxes ? "Cancel" : "Mark as Paid"}
                                </button>
                                {showCheckboxes && (
                                    <button
                                        onClick={handleMarkSelectedPaid}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                        disabled={selectedStudentIds.length === 0}
                                    >
                                        Confirm Paid ({selectedStudentIds.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Batch</label>
                            <select
                                value={batchFilter}
                                onChange={(e) => {
                                    setBatchFilter(e.target.value);
                                    setSubjectFilter(""); // Reset subject filter when batch changes
                                }}
                                className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                            >
                                <option value="">All Batches</option>
                                {batches.map((batch) => (
                                    <option key={batch.batchId} value={batch.batchId}>
                                        {batch.batchName} (Class {batch.forStandard})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Subject</label>
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 text-sm"
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
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
                            <select
                                value={paidFilter}
                                onChange={(e) => setPaidFilter(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                {showCheckboxes && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                                            className="rounded border-gray-300"
                                        />
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updates</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100 text-sm text-gray-700">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={showCheckboxes ? "7" : "6"} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-10 h-10 text-gray-300" />
                                            <p className="font-medium">No students found</p>
                                            <p className="text-xs">Adjust filters to see results</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.studentId} className="hover:bg-gray-50">
                                        {showCheckboxes && (
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudentIds.includes(student.studentId)}
                                                    onChange={() => handleCheckboxChange(student.studentId)}
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#e7c6a5] flex items-center justify-center text-xs font-semibold text-[#4a3a2c]">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#4a3a2c]">{student.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-500" />
                                                <span>{student.batchName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-gray-500" />
                                                <span>{student.subjects.join(", ") || "No Subjects"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-gray-500" />
                                                <span className="font-semibold">₹{student.amount.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.isPaidThisMonth)}`}>
                                                    {getStatusIcon(student.isPaidThisMonth)}
                                                    {student.isPaidThisMonth ? "Paid" : "Unpaid"}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.feeStatus && student.feeStatus.length > 0 ? (
                                                <div className="space-y-1">
                                                    {student.feeStatus
                                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                        .slice(0, 2)
                                                        .map((status, index) => (
                                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-500">
                                                                        {new Date(status.date).toLocaleDateString()}
                                                                    </span>
                                                                <span className={`px-2 py-1 rounded text-xs ${status.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {status.paid ? "Paid" : "Unpaid"}
                                                                    </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">No updates</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
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