import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import useGetBatchId from "./hooks/useGetBatchId.js";
import editStudentAttendance from "./hooks/editStudentAttendence.jsx";
import { getTotalClasses } from "@/pages/Attendence/hooks/getTotalClasses.jsx";
import useFetchAllBatch from "@/pages/BatchPage/Functions/useFetchAllBatch.jsx";

const AttendancePage = () => {
    const [batchName, setBatchName] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [date, setDate] = useState("");
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [allStudentsList, setAllStudentsList] = useState([]);
    const [fetchedStudents, setFetchedStudents] = useState([]);
    const [presentStudentIds, setPresentStudentIds] = useState(new Set());
    const [alreadyPresentStudents, setAlreadyPresentStudents] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formTouched, setFormTouched] = useState(false);
    const [totalClassesCount, setTotalClassesCount] = useState(0);

    const { batchId, subjectId } = useGetBatchId(batchName, subjectName);

    useEffect(() => {
        useFetchAllBatch().then(setBatches);
    }, []);

    useEffect(() => {
        const matched = batches.find(b => b.name === batchName);
        setSelectedBatch(matched || null);
    }, [batchName, batches]);

    useEffect(() => {
        if (batchId && subjectId && isTodaySelected()) {
            fetchAllStudents();
            fetchTotalClasses();
        } else {
            setAllStudentsList([]);
            setFetchedStudents([]);
            setPresentStudentIds(new Set());
            setAlreadyPresentStudents([]);
            setTotalClassesCount(0);
        }
    }, [batchId, subjectId, date]);

    const isTodaySelected = () => {
        const selected = new Date(date);
        const now = new Date();
        return selected.toDateString() === now.toDateString();
    };

    const isSubjectScheduledToday = () => {
        if (!selectedBatch || !subjectName || !date) return false;
        const day = new Date(date).toLocaleString("en-US", { weekday: "long" });
        const subject = selectedBatch.subject.find(s => s.name === subjectName);
        return subject?.classSchedule.some(sch => sch.days.includes(day));
    };

    const togglePresent = (studentId) => {
        setPresentStudentIds((prev) => {
            const updated = new Set(prev);
            updated.has(studentId) ? updated.delete(studentId) : updated.add(studentId);
            return updated;
        });
    };

    const fetchTotalClasses = async () => {
        try {
            const count = await getTotalClasses(batchId, subjectId);
            setTotalClassesCount(count);
        } catch {
            setTotalClassesCount(0);
        }
    };

    const fetchAllStudents = async () => {
        setError("");
        setIsLoading(true);

        try {
            const res = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
            const students = res.data || [];
            const formattedDate = new Date(date).toISOString().split("T")[0];

            const alreadyMarkedPresent = [];
            const alreadyMarkedIds = new Set();

            for (const student of students) {
                const isPresent = (student.attendance || []).some(record => {
                    const datePart = new Date(record.date).toISOString().split("T")[0];
                    return datePart === formattedDate && record.subject === subjectId;
                });
                if (isPresent) {
                    alreadyMarkedPresent.push({ student, time: "Marked" });
                    alreadyMarkedIds.add(student._id);
                }
            }

            setAllStudentsList(students);
            setAlreadyPresentStudents(alreadyMarkedPresent);
            setFetchedStudents(students.filter(s => !alreadyMarkedIds.has(s._id)));
        } catch {
            setError("Failed to fetch students.");
        } finally {
            setIsLoading(false);
        }
    };

    const submitAttendance = async () => {
        setFormTouched(true);
        setError("");

        if (!batchName || !subjectName || !date) return setError("All fields are required.");

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return setError("Cannot mark attendance for past dates.");
        }

        if (!isSubjectScheduledToday()) {
            return setError("Class not scheduled for selected subject today.");
        }

        if (presentStudentIds.size === 0) {
            return alert("No students marked present.");
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
                await fetchAllStudents();
                setPresentStudentIds(new Set());
            } else {
                setError("Some attendance records failed.");
            }
        } catch {
            setError("Failed to submit attendance.");
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
        setTotalClassesCount(0);
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
                                {allStudentsList.map((student) => {
                                    const subjectAttendance = (student.attendance || []).filter(
                                        record => record.subject === subjectId
                                    );
                                    const presentCount = subjectAttendance.filter(record => record.present).length;
                                    const percentage = totalClassesCount > 0
                                        ? Math.round((presentCount / totalClassesCount) * 100)
                                        : 0;

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
                            <select
                                value={batchName}
                                onChange={(e) => {
                                    setBatchName(e.target.value);
                                    setFormTouched(true);
                                }}
                                className="border-2 rounded-2xl w-full text-xl p-2"
                                disabled={isLoading}
                            >
                                <option value="">Select Batch</option>
                                {batches.map((b, i) => (
                                    <option key={i} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                            <select
                                value={subjectName}
                                onChange={(e) => {
                                    setSubjectName(e.target.value);
                                    setFormTouched(true);
                                }}
                                className="border-2 rounded-2xl w-full text-xl p-2"
                                disabled={isLoading || !selectedBatch}
                            >
                                <option value="">Select Subject</option>
                                {selectedBatch?.subject.map((s, i) => (
                                    <option key={i} value={s.name}>{s.name}</option>
                                ))}
                            </select>
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
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <div className="flex gap-2 w-full">
                                <button
                                    className="w-1/2 border-2 rounded-lg p-2 cursor-pointer disabled:opacity-50"
                                    onClick={fetchAllStudents}
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
                                {fetchedStudents.map((student, index) => {
                                    const isPresent = presentStudentIds.has(student._id);
                                    return (
                                        <div key={student._id} className="border p-3 rounded-lg flex justify-between items-center">
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
                            </div>
                        </div>
                        <div className="flex flex-col w-1/2 border-2 rounded-r-xl overflow-hidden">
                            <div className="p-4 border-b-2">
                                <h2 className="text-lg font-semibold">
                                    Already Marked Present on: {date || "N/A"}
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
                                {alreadyPresentStudents.map((entry, index) => (
                                    <div key={entry.student._id} className="border p-3 rounded-lg flex justify-between items-center">
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

export default AttendancePage;
