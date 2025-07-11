import React from "react";

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
    return (
        <div className="bg-white rounded-2xl p-4 text-black flex-1 overflow-y-auto">
            <div className="flex justify-between mb-4 items-center">
                <h2 className="font-bold text-lg">Mark Attendance</h2>
                <div className="text-sm text-gray-600">
                    {presentIds.size} of {students.length} marked present
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={selectAll}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                        disabled={!students.length || loading}
                    >
                        Select All
                    </button>
                    <button
                        onClick={markAllPreviouslyPresent}
                        className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-600 transition-colors"
                        disabled={!markedPresentStudents.length || loading}
                    >
                        Mark All Already Present
                    </button>
                    <button
                        onClick={clearAll}
                        className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 transition-colors"
                        disabled={!presentIds.size || loading}
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        disabled={loading || !presentIds.size || !isValidDateTime()}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>

            {students.length > 0 ? (
                students.map((s, i) => (
                    <div
                        key={s._id}
                        className="border p-3 rounded-md mb-2 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
            <span>
              {i + 1}. {s.name}
            </span>
                        <button
                            onClick={() => togglePresent(s._id)}
                            className={`w-8 h-8 border border-black rounded-full flex items-center justify-center transition-colors ${
                                presentIds.has(s._id)
                                    ? "bg-green-500 text-white"
                                    : "bg-white text-black hover:bg-gray-100"
                            }`}
                            disabled={loading}
                        >
                            {presentIds.has(s._id) ? "✓" : ""}
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 mt-8">
                    {batchName && subjectName && date
                        ? "No students found for this batch and subject"
                        : "Please select batch, subject, and date first"}
                </div>
            )}
        </div>
    );
};