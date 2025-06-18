import React from "react";

const AttendanceList = ({
                            students,
                            presentStudentIds,
                            togglePresent,
                            isLoading
                        }) => {
    if (students.length === 0) {
        return <p className="text-gray-500">No students available or already marked for this date.</p>;
    }

    return (
        <>
            {students.map((student, index) => {
                const isPresent = presentStudentIds.has(student._id);
                return (
                    <div
                        key={student._id}
                        className="border p-3 rounded-lg flex justify-between items-center"
                    >
                        <span className="font-medium">{index + 1}.</span>
                        <span className="flex-1 ml-3">{student.name}</span>
                        <button
                            onClick={() => togglePresent(student._id)}
                            className={`w-8 h-8 border rounded-full flex items-center justify-center transition ${
                                isPresent ? "bg-green-500 text-white" : "bg-white text-gray-600"
                            }`}
                            disabled={isLoading}
                        >
                            {isPresent ? "✓" : ""}
                        </button>
                    </div>
                );
            })}
        </>
    );
};

export default AttendanceList;
