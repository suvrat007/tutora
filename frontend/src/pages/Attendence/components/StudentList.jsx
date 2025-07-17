import React from "react";
import { FaCheckCircle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

export const StudentList = ({
                                students,
                                presentIds,
                                loading,
                                markedPresentStudents,
                                togglePresent,
                                selectAll,
                                clearAll,
                                markAllPreviouslyPresent,
                                handleSubmit,
                                isValidDateTime,
                                batchName,
                                subjectName,
                                date
                            }) => {
    const isFormValid = batchName && subjectName && date && isValidDateTime();

    return (
        <div className="bg-[#f4e3d0] rounded-2xl p-4 text-[#4a3a2c] flex-1 overflow-y-auto border border-[#ddb892]">
            <div className="flex justify-between mb-4 items-center">
                <h2 className="font-bold text-lg text-[#4a3a2c]">Mark Attendance</h2>
                <div className="text-sm text-[#6b4c3b]">
                    {presentIds.size} of {students.length} marked present
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={selectAll}
                        className="bg-[#d7b48f] text-[#4a3a2c] px-3 py-1 rounded-md text-sm hover:bg-[#d7b48f]/80 transition-colors disabled:opacity-50"
                        disabled={!students.length || loading}
                    >
                        Select All
                    </button>
                    <button
                        onClick={markAllPreviouslyPresent}
                        className="bg-[#d7b48f] text-[#4a3a2c] px-3 py-1 rounded-md text-sm hover:bg-[#d7b48f]/80 transition-colors disabled:opacity-50"
                        disabled={!markedPresentStudents.length || loading}
                    >
                        Mark All Already Present
                    </button>
                    <button
                        onClick={clearAll}
                        className="bg-[#d7b48f] text-[#4a3a2c] px-3 py-1 rounded-md text-sm hover:bg-[#d7b48f]/80 transition-colors disabled:opacity-50"
                        disabled={!presentIds.size || loading}
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-[#d7b48f] text-[#4a3a2c] px-4 py-2 rounded-md hover:bg-[#d7b48f]/80 transition-colors disabled:opacity-50"
                        disabled={loading || !isFormValid}
                    >
                        {loading ? 'Submitting...' : presentIds.size === 0 ? 'Mark All Absent' : `Submit (${presentIds.size} Present)`}
                    </button>
                </div>
            </div>

            {students.length > 0 ? (
                students.map((s, i) => (
                    <div
                        key={s._id}
                        className="border border-[#ddb892] p-3 rounded-md mb-2 flex justify-between items-center hover:bg-[#e7c6a5] transition-colors"
                    >
                        <span className="text-[#4a3a2c]">
                            {i + 1}. {s.name}
                        </span>
                        <button
                            onClick={() => togglePresent(s._id)}
                            className={`w-8 h-8 border border-[#6b4c3b] rounded-full flex items-center justify-center transition-colors ${
                                presentIds.has(s._id)
                                    ? "bg-green-500 text-white"
                                    : "bg-[#f4e3d0] text-[#4a3a2c] hover:bg-[#e7c6a5]"
                            }`}
                            disabled={loading}
                        >
                            {presentIds.has(s._id) ? <FaCheckCircle /> : ""}
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center text-[#6b4c3b] mt-8">
                    {batchName && subjectName && date
                        ? "No students found for this batch and subject"
                        : "Please select batch, subject, and date first"}
                </div>
            )}
        </div>
    );
};