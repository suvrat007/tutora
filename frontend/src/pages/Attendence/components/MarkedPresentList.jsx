import React from "react";

const MarkedPresentList = ({
                               markedPresentStudents,
                               batchName,
                               subjectName,
                               date
                           }) => {
    return (
        <div className="bg-white rounded-2xl p-4 text-black flex-1 overflow-y-auto border-l-2 border-green-200">
            <div className="flex justify-between mb-4 items-center">
                <h2 className="font-bold text-lg text-green-700">Already Marked Present</h2>
                <div className="text-sm text-gray-600">
                    {markedPresentStudents.length} students
                </div>
            </div>
            {markedPresentStudents.length > 0 ? (
                markedPresentStudents.map((s, i) => (
                    <div
                        key={s._id}
                        className="border border-green-200 bg-green-50 p-3 rounded-md mb-2 flex justify-between items-center"
                    >
            <span>
              {i + 1}. {s.name}
            </span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{s.time}</span>
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                                ✓
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 mt-8">
                    {batchName && subjectName && date
                        ? "No students marked present for this date"
                        : "Please search for students first"}
                </div>
            )}
        </div>
    );
};

export default MarkedPresentList;