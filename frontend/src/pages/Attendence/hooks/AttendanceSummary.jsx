import React from "react";

const AttendanceSummary = ({ students, subjectId, totalClassesCount }) => {
    if (students.length === 0) {
        return <p className="text-gray-500 p-2">Select Batch and Subject to see attendance summary.</p>;
    }

    return (
        <ul className="p-2 space-y-2 overflow-y-scroll h-[12em] flex flex-wrap gap-2">
            {students.map((student) => {
                const subjectAttendance = (student.attendance || []).filter(
                    (record) => record.subject === subjectId
                );
                const presentCount = subjectAttendance.filter(
                    (record) => record.present === true
                ).length;

                const percentage =
                    totalClassesCount > 0 ? Math.round((presentCount / totalClassesCount) * 100) : 0;

                return (
                    <li
                        key={student._id}
                        className="flex flex-col rounded-xl justify-center items-center h-[5em] border-2 w-[8em]"
                    >
                        <span>{student.name}</span>
                        <span className="font-bold">{percentage}%</span>
                    </li>
                );
            })}
        </ul>
    );
};

export default AttendanceSummary;
