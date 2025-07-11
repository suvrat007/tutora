import React from "react";
import useAttendanceSummary from "@/pages/Attendence/hooks/useAttendanceSummary.js";

const AttendancePercentages = ({attendance, batchName, setBatchName, subjectName, setSubjectName, batches}) => {
    const { summary, loading, error } = useAttendanceSummary(batchName, subjectName, batches);
    const selectedBatch = batches.find((b) => b.name === batchName);

    return (
        <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1">
            <div className="bg-white h-full rounded-2xl p-4 text-black flex flex-col gap-3">
                <div className={'flex items-center justify-between'}>
                    <h2 className="font-bold text-lg">Attendance Summary</h2>

                    <div>
                        <select
                            value={batchName}
                            onChange={(e) => {
                                setBatchName(e.target.value);
                                setSubjectName('');
                            }}
                            className="border p-2 rounded-md "
                        >
                            <option value="">Select Batch</option>
                            {batches.map((b) => (
                                <option key={b._id} value={b.name}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className="border p-2 rounded-md"
                            disabled={!batchName}
                        >
                            <option value="">Select Subject</option>
                            {selectedBatch?.subject.map((s) => (
                                <option key={s._id} value={s.name}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                <div>
                    {batchName && subjectName && !loading && !error && (
                        <div className="mt-2 overflow-x-auto">
                            {summary.length > 0 ? (
                                <table className="w-full border-collapse border border-gray-200">
                                    <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2 text-left">Student</th>
                                        <th className="border p-2 text-left">Subject</th>
                                        <th className="border p-2 text-left">Attended</th>
                                        <th className="border p-2 text-left">Total</th>
                                        <th className="border p-2 text-left">Percentage</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {summary.map((student) =>
                                        student.subjects.map((subj) => (
                                            <tr key={`${student.studentId}-${subj.subjectId}`} className="hover:bg-gray-50">
                                                <td className="border p-2">{student.studentName}</td>
                                                <td className="border p-2">{subj.subjectName}</td>
                                                <td className="border p-2">{subj.attended}</td>
                                                <td className="border p-2">{subj.total}</td>
                                                <td className="border p-2">{subj.percentage}%</td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500 text-center mt-4">
                                    No attendance data found for selected batch and subject
                                </p>
                            )}
                        </div>
                    )}
                </div>
                {/* Error and Loading States */}
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {loading && <p className="text-gray-600">Loading attendance summary...</p>}

                {/* Attendance Table */}


                {!batchName && !subjectName && (
                    <p className="text-gray-500 text-center mt-4">
                        Please select a batch and subject to view attendance summary
                    </p>
                )}
            </div>
        </div>
    );
}
export default AttendancePercentages