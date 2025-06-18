import React from "react";

const AlreadyPresentList = ({ alreadyPresentStudents, date }) => {
    if (!alreadyPresentStudents || alreadyPresentStudents.length === 0) {
        return <p className="text-gray-500">No students marked present for this date.</p>;
    }

    return (
        <>
            {alreadyPresentStudents.map((entry, index) => (
                <div
                    key={entry.student._id}
                    className="border p-3 rounded-lg flex justify-between items-center"
                >
                    <span className="font-medium">{index + 1}.</span>
                    <span className="flex-1 ml-3">{entry.student.name}</span>
                    <span className="text-green-600 font-semibold">Present</span>
                    <span className="text-green-600 font-semibold">{entry.time}</span>
                </div>
            ))}
        </>
    );
};

export default AlreadyPresentList;
