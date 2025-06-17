import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import useGetBatchId from "./hooks/useGetBatchId.js";
import editStudentAttendance from "./hooks/editStudentAttendence.jsx";
import { getTotalClasses } from "@/pages/Attendence/hooks/getTotalClasses.jsx"; // Correct import path

const AttendencePage = () => {
    const [batchName, setBatchName] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [date, setDate] = useState("");
    const [allStudentsList, setAllStudentsList] = useState([]);
    const [fetchedStudents, setFetchedStudents] = useState([]);
    const [presentStudentIds, setPresentStudentIds] = useState(new Set());
    const [alreadyPresentStudents, setAlreadyPresentStudents] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formTouched, setFormTouched] = useState(false);
    const [totalClassesCount, setTotalClassesCount] = useState(0); // New state for total classes

    const { batchId, subjectId } = useGetBatchId(batchName, subjectName);

    useEffect(() => {
        if (batchId && subjectId) {
            fetchAllStudents();
            fetchTotalClasses(); // Fetch total classes when batch or subject changes
        } else {
            // Clear students and total classes if batch/subject not selected
            setAllStudentsList([]);
            setFetchedStudents([]);
            setPresentStudentIds(new Set());
            setAlreadyPresentStudents([]);
            setTotalClassesCount(0);
        }
    }, [batchId, subjectId, date]); // Add date to dependency array to refetch when date changes

    const fetchTotalClasses = async () => {
        if (batchId && subjectId) {
            try {
                const count = await getTotalClasses(batchId, subjectId);
                setTotalClassesCount(count);
            } catch (err) {
                console.error("Error fetching total classes:", err);
                // Handle error for fetching total classes
                setTotalClassesCount(0); // Reset in case of error
            }
        }
    };


    const togglePresent = (studentId) => {
        setPresentStudentIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(studentId)) {
                updated.delete(studentId);
            } else {
                updated.add(studentId);
            }
            return updated;
        });
    };

    const fetchAllStudents = async () => {
        setError("");
        setIsLoading(true);

        if (!batchId) {
            setError("Batch ID is required to fetch students.");
            setIsLoading(false);
            return;
        }
        try {
            const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
            const students = response.data || [];
            console.log("API response:", response.data);

            const formattedDate = date ? new Date(date).toISOString().split("T")[0] : null;
            const alreadyMarkedPresent = [];
            const alreadyMarkedIds = new Set();

            for (const student of students) {
                const attendances = student?.attendance || [];
                if (formattedDate && subjectId) {
                    let time;
                    const isPresent = attendances.some((record) => {
                        if (!record.date) {
                            console.warn(`Invalid date for student ${student._id}:`, record);
                            return false;
                        }
                        const dateObj = new Date(record.date);
                        if (isNaN(dateObj.getTime())) {
                            console.warn(`Invalid date format for student ${student._id}:`, record.date);
                            return false;
                        }
                        const datePart = dateObj.toISOString().split("T")[0];
                        time = dateObj.toLocaleTimeString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        }); // e.g., "14:30:00"
                        console.log(`Checking: date=${datePart}, time=${time}, subject=${record.subject}`);
                        return datePart === formattedDate && record.subject === subjectId;
                    });
                    if (isPresent) {
                        console.log("Student present:", student.name, "Time:", time);
                        alreadyMarkedPresent.push({ student, time });
                        alreadyMarkedIds.add(student._id);
                    }
                }
            }

            setAllStudentsList(students);
            setAlreadyPresentStudents(alreadyMarkedPresent);
            const filteredStudents = students.filter((student) => !alreadyMarkedIds.has(student._id));
            setFetchedStudents(filteredStudents);
            setPresentStudentIds(new Set()); // Ensure this is cleared when new students are fetched
        } catch (err) {
            console.error("Error fetching students:", err.response?.data || err.message);
            setError("Failed to fetch students. Please try again.");
            setAlreadyPresentStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    const submitAttendance = async () => {
        setFormTouched(true);
        setError("");
        setIsLoading(true);

        if (!batchName || !subjectName || !date) {
            setError("Please enter all the required fields (Batch, Subject, and Date).");
            setIsLoading(false);
            return;
        }

        if (presentStudentIds.size === 0) {
            alert("No students marked as present.");
            setIsLoading(false);
            return;
        }

        try {
            const errors = await editStudentAttendance(
                Array.from(presentStudentIds),
                subjectId,
                batchId,
                date
            );
            if (errors.length === 0) {
                alert("Attendance submitted successfully!");
                await fetchAllStudents(); // Re-fetch students to update the lists
                setPresentStudentIds(new Set()); // Clear selection after submit
            } else {
                setError("Some attendance records failed to submit.");
            }
        } catch (err) {
            console.error("Error submitting attendance:", err);
            setError("Failed to submit attendance. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const clearForm = () => {
        setBatchName("");
        setSubjectName("");
        setDate("");
        setAllStudentsList([]);
        setFetchedStudents([]);
        setPresentStudentIds(new Set());
        setAlreadyPresentStudents([]);
        setError("");
        setFormTouched(false);
        setIsLoading(false);
        setTotalClassesCount(0); // Clear total classes count
    };


    return (
        <div className="flex h-screen">
            <SideBar />
            <div className="flex flex-col w-full overflow-hidden">
                <Navbar />
                <div className="flex flex-col gap-4 m-2 overflow-hidden flex-1 items-center">
                    <div className="flex gap-4 w-[75%] p-4 border-2 rounded-2xl">
                        <div className="flex flex-col border-2 rounded-2xl flex-1 w-1/2">
                            <p className="text-xl mt-3 ml-3">Overall Attendance Summary</p>
                            <ul className="p-2 space-y-2 overflow-y-scroll h-[12em] flex flex-wrap gap-2">
                                {allStudentsList.length === 0 && !isLoading && (
                                    <p className="text-gray-500 p-2">Select Batch and Subject to see attendance summary.</p>
                                )}
                                {allStudentsList.map((student) => {
                                    const subjectAttendance = (student.attendance || []).filter(
                                        (record) => record.subject === subjectId
                                    );
                                    const presentCount = subjectAttendance.filter(
                                        (record) => record.present === true
                                    ).length;

                                    // Calculate percentage, handling division by zero
                                    const percentage = totalClassesCount > 0
                                        ? Math.round((presentCount / totalClassesCount)*100)
                                        : 0; // If totalClassesCount is 0, percentage is 0

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
                        </div>
                        <div className="flex flex-col gap-3 w-1/2 justify-between">
                            <input
                                type="text"
                                placeholder="Enter Batch"
                                value={batchName}
                                onChange={(e) => {
                                    setBatchName(e.target.value);
                                    setFormTouched(true);
                                }}
                                className="border-2 rounded-2xl w-full text-xl p-2"
                                disabled={isLoading}
                            />
                            {formTouched && !batchName && (
                                <p className="text-red-500 text-sm ml-2">Batch is required.</p>
                            )}
                            <input
                                type="text"
                                placeholder="Enter Subject"
                                value={subjectName}
                                onChange={(e) => {
                                    setSubjectName(e.target.value);
                                    setFormTouched(true);
                                }}
                                className="border-2 rounded-2xl w-full text-xl p-2"
                                disabled={isLoading}
                            />
                            {formTouched && !subjectName && (
                                <p className="text-red-500 text-sm ml-2">Subject is required.</p>
                            )}
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setFormTouched(true);
                                }}
                                className="border-2 rounded-2xl w-full text-xl p-2"
                                disabled={isLoading}
                            />
                            {formTouched && !date && (
                                <p className="text-red-500 text-sm ml-2">Date is required.</p>
                            )}
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <div className="flex gap-2 w-full">
                                <button
                                    className="w-1/2 border-2 rounded-lg p-2 cursor-pointer disabled:opacity-50"
                                    onClick={fetchAllStudents} // This will also trigger fetchTotalClasses due to useEffect
                                    disabled={isLoading || !batchName || !subjectName || !date}
                                >
                                    {isLoading ? "Loading..." : "Search"}
                                </button>
                                <button
                                    className="w-1/2 border-2 rounded-lg p-2 cursor-pointer disabled:opacity-50"
                                    onClick={clearForm}
                                    disabled={isLoading}
                                >
                                    Clear Form
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex px-4 pb-1 w-full flex-1 overflow-hidden">
                        <div className="flex flex-col w-1/2 border-2 rounded-l-xl overflow-hidden">
                            <div className="p-2 border-b-2 flex justify-between items-center">
                                <h2 className="text-lg font-semibold">All Students in Batch</h2>
                                <button
                                    className="p-2 border-2 rounded-lg cursor-pointer disabled:opacity-50"
                                    onClick={submitAttendance}
                                    disabled={isLoading || !batchName || !subjectName || !date}
                                >
                                    Submit Attendance
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
                                {fetchedStudents.length === 0 && !isLoading && (
                                    <p className="text-gray-500">
                                        No students available or already marked for this date.
                                    </p>
                                )}
                                {fetchedStudents.map((student, index) => {
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
                                                    isPresent
                                                        ? "bg-green-500 text-white"
                                                        : "bg-white text-gray-600"
                                                }`}
                                                disabled={isLoading}
                                            >
                                                {isPresent ? "✓" : ""}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex flex-col w-1/2 border-2 rounded-r-xl overflow-hidden">
                            <div className="p-4 border-b-2">
                                <h2 className="text-lg font-semibold">
                                    Already Marked Present on: {date || "N/A"}
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
                                {(!alreadyPresentStudents || alreadyPresentStudents.length === 0) && (
                                    <p className="text-gray-500">
                                        No students marked present for this date.
                                    </p>
                                )}
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendencePage;