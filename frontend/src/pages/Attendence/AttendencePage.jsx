import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import { useState } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import useGetBatchId from "./hooks/useGetBatchId.js";
import editStudentAttendence from "./hooks/editStudentAttendence.jsx";

const AttendencePage = () => {
    const [batchName, setBatchName] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [date, setDate] = useState("");
    const [allStudentsList, setAllStudentsList] = useState([]);
    const [fetchedStudents, setFetchedStudents] = useState([]);
    const [presentStudentIds, setPresentStudentIds] = useState(new Set());
    const [alreadyPresentStudents, setAlreadyPresentStudents] = useState([]);
    const [error, setError] = useState("");
    const [formTouched, setFormTouched] = useState(false);

    const { batchId, subjectId } = useGetBatchId(batchName, subjectName);
    console.log(subjectId);
    const togglePresent = (studentId) => {
        setPresentStudentIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(studentId)) updated.delete(studentId);
            else updated.add(studentId);
            return updated;
        });
    };

    const submitAttendance = async () => {
        setFormTouched(true);
        setError("");

        if (!batchName || !subjectName || !date) {
            setError("Please enter all the required fields (Batch, Subject, and Date).");
            return;
        }

        if (presentStudentIds.size === 0) {
            alert("No students marked as present.");
            return;
        }

        try {
            await editStudentAttendence(Array.from(presentStudentIds), subjectId, batchId, date);
            alert("Attendance submitted successfully!");
            setPresentStudentIds(new Set());
            fetchAllStudents();
        } catch (err) {
            console.error("Error submitting attendance:", err);
            setError("Failed to submit attendance. Please try again.");
        }
    };


    const fetchAllStudents = async () => {
        setError("");
        setFormTouched(true);

        if (!batchName || !subjectName || !date) {
            setError("Batch, Subject, and Date are required to fetch students.");
            return;
        }

        try {
            const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
            const students = response.data || [];
            console.log(students)

            const alreadyMarkedPresent = new Set();
            const alreadyMarkedIds = new Set();

            for (const student of students) {
                const attendances = student?.attendance || [];
                for (const record of attendances) {
                    const recordDate = new Date(record.date).toLocaleDateString("en-CA");
                    if (recordDate === date && record.subject === subjectId) {
                        alreadyMarkedPresent.add(student);
                        alreadyMarkedIds.add(student._id);
                        break;
                    }
                }

            }
            setAllStudentsList(students)
            setAlreadyPresentStudents(Array.from(alreadyMarkedPresent));
            const filteredStudents = students.filter((student) => !alreadyMarkedIds.has(student._id));
            // console.log(filteredStudents)
            setFetchedStudents(filteredStudents);
            setPresentStudentIds(new Set()); // Clear previous selection
        } catch (err) {
            console.error("Error fetching students:", err);
            setError("Failed to fetch students. Please try again later.");
        }
    };


    // console.log(alreadyPresentStudents)

    return (
        <div className="flex h-screen">
            <SideBar />

            <div className="flex flex-col w-full overflow-hidden">
                <Navbar />

                <div className="flex flex-col gap-4 m-2 overflow-hidden flex-1 items-center">
                    {/* === TOP FORM SECTION === */}
                    <div className="flex gap-4 w-[75%] p-4 border-2 rounded-2xl">
                        {/*<div className="flex flex-col border-2 rounded-2xl flex-1 w-1/2">*/}
                        {/*    <p className="text-xl mt-3 ml-3">*/}
                        {/*        Student's Attendance Percentage Till Date:*/}
                        {/*    </p>*/}
                        {/*    <div className="flex flex-col items-center justify-center flex-1">*/}
                        {/*        <h1 className="text-[5em] p-10 border-2 rounded-[50%] m-2">*/}
                        {/*            100%*/}
                        {/*        </h1>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        <div className="flex flex-col border-2 rounded-2xl flex-1 w-1/2">
                            <p className="text-xl mt-3 ml-3">Overall Attendance Summary</p>
                            <ul className="p-2 space-y-2 overflow-y-scroll h-[12em] flex flex-wrap justify-between">
                                {allStudentsList.map((student) => {
                                    // Filter attendance for the specific subject
                                    const subjectAttendance = student.attendance.filter(
                                        (record) => record.subject === subjectId
                                    );

                                    const presentCount = subjectAttendance.filter(record => record.present).length;

                                    // Calculate the total number of classes held for this subject
                                    const totalClassesHeld = Math.max(
                                        ...allStudentsList.map(s =>
                                            s.attendance.filter(record => record.subject === subjectId).length
                                        )
                                    ) || 1; // Prevent division by zero

                                    const percentage = Math.round((presentCount / totalClassesHeld) * 100);

                                    return (
                                        <li
                                            key={student._id}
                                            className="flex flex-col rounded-xl justify-center items-center h-[5em] border-2 w-1/3"
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
                                onChange={(e) => setBatchName(e.target.value)}
                                className="border-2 rounded-2xl w-full text-xl p-2"
                            />
                            {formTouched && !batchName &&
                                <p className="text-red-500 text-sm ml-2">Batch is required.</p>}

                            <input
                                type="text"
                                placeholder="Enter Subject"
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                                className="border-2 rounded-2xl w-full text-xl p-2"
                            />
                            {formTouched && !subjectName &&
                                <p className="text-red-500 text-sm ml-2">Subject is required.</p>}

                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="border-2 rounded-2xl w-full text-xl p-2"
                            />
                            {formTouched && !date && <p className="text-red-500 text-sm ml-2">Date is required.</p>}

                            {error && <p className="text-red-600 text-sm">{error}</p>}

                            <button
                                className="w-full border-2 rounded-lg p-2"
                                onClick={fetchAllStudents}
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* === MAIN ATTENDANCE SECTION === */}
                    <div className="flex px-4 pb-1 w-full flex-1 overflow-hidden">
                        {/* LEFT: Mark Attendance */}
                        <div className="flex flex-col w-1/2 border-2 rounded-l-xl overflow-hidden">
                            <div className="p-2 border-b-2 flex justify-between items-center">
                                <h2 className="text-lg font-semibold">All Students in Batch</h2>
                                <button
                                    className="p-2 border-2 rounded-lg cursor-pointer"
                                    onClick={submitAttendance}
                                >
                                    Submit Attendance
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
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
                                <h2 className="text-lg font-semibold">Already Marked Present on: {date}</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
                                {alreadyPresentStudents.map((student, index) => (
                                    <div
                                        key={student._id}
                                        className="border p-3 rounded-lg flex justify-between items-center"
                                    >
                                        <span className="font-medium">{index + 1}.</span>
                                        <span className="flex-1 ml-3">{student.name}</span>
                                        <span className="text-green-600 font-semibold">Present</span>
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
