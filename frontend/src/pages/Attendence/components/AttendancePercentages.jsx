import React from "react";
import useAttendanceSummary from "@/pages/Attendence/hooks/useAttendanceSummary.js";

const AttendancePercentages = ({attendance, batchName, setBatchName, subjectName, setSubjectName, batches}) => {
    const { summary, loading, error } = useAttendanceSummary(batchName, subjectName, batches);
    const selectedBatch = batches.find((b) => b.name === batchName);

    return (
        <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1 h-[16em]">
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
                                <div className="flex flex-wrap justify-center gap-4  h-[8.5em] overflow-y-auto ">
                                    {summary.map((student) =>
                                        student.subjects.map((subj) => {
                                            const percentage = subj.percentage;
                                            const strokeDasharray = 113;
                                            const strokeDashoffset = ((100 - percentage) / 100) * strokeDasharray;

                                            return (
                                                <div
                                                    key={`${student.studentId}-${subj.subjectId}`}
                                                    className="bg-[#fff4ea] h-[7em] p-2 rounded-xl shadow-md w-[8.5rem] flex flex-col items-center"
                                                >
                                                    <h3 className="text-sm font-semibold text-center mb-2">{student.studentName}</h3>

                                                    <div className={'flex gap-2'}>
                                                        <svg className="w-16 h-16" viewBox="0 0 40 40">
                                                            <circle
                                                                cx="20"
                                                                cy="20"
                                                                r="18"
                                                                fill="none"
                                                                stroke="#e0e0e0"
                                                                strokeWidth="4"
                                                            />
                                                            <circle
                                                                cx="20"
                                                                cy="20"
                                                                r="18"
                                                                fill="none"
                                                                stroke="#f7a400"
                                                                strokeWidth="4"
                                                                strokeDasharray={strokeDasharray}
                                                                strokeDashoffset={strokeDashoffset}
                                                                transform="rotate(-90 20 20)"
                                                            />
                                                            <text
                                                                x="50%"
                                                                y="50%"
                                                                dominantBaseline="middle"
                                                                textAnchor="middle"
                                                                className="text-[.6em]"
                                                                fill="#000"
                                                            >
                                                                {percentage}%
                                                            </text>
                                                        </svg>

                                                        <div className="text-[.7em] text-gray-700 mt-2 text-center">
                                                            <p><strong>Attended:</strong> {subj.attended}</p>
                                                            <p><strong>Total:</strong> {subj.total}</p>
                                                        </div>
                                                    </div>

                                                </div>
                                            );
                                        })
                                    )}
                                </div>
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