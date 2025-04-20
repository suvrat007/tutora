import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import {useState} from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import useGetBatchId from "./hooks/useGetBatchId.js";
import editStudentAttendence from "./hooks/editStudentAttendence.jsx";

const AttendencePage = () => {
    const [batchName, setBatchName] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [date, setDate] = useState(null);
    const [fetchedStudents, setFetchedStudents] = useState([]);
    const [presentStudentIds, setPresentStudentIds] = useState(new Set());

    const {batchId,subjectId} = useGetBatchId(batchName,subjectName);

    const submitAttendance = async () => {
        if (!presentStudentIds.size) {
            alert("No students marked as present.");
            return;
        }
        await editStudentAttendence(Array.from(presentStudentIds), subjectId, batchId,date);
        alert("Attendance submitted successfully!");
    };


    const fetchAllStudents = async () => {
        if (!batchId) {
            alert("Invalid batch name or batch ID not found yet.");
            return;
        }
        try {
            const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
            setFetchedStudents(response.data || []);
            setPresentStudentIds(new Set()); // Reset on new fetch
        } catch (error) {
            console.log(error);
        }
    };

    // making student id list set
    const togglePresent = (studentId) => {
        setPresentStudentIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };


    //Make it fetch data again
    // then update the present students
    // fetch both attended and all....show only ones who attended in right and absent on left
    return (
        <div className="flex h-screen">
            <SideBar />

            <div className="flex flex-col w-full overflow-hidden">
                <Navbar />

                <div className="flex flex-col gap-4 m-2 overflow-hidden flex-1 justify-between items-center">
                    {/* Upper Section */}
                    <div className="flex gap-4 w-[75%] p-4 border-2 rounded-2xl">
                        <div className="flex flex-col border-2 rounded-2xl flex-1 w-1/2">
                            <p className="text-xl mt-3 ml-3">
                                Student's Attendance Percentage Till Date:
                            </p>
                            <div className="flex flex-col items-center justify-center flex-1">
                                <h1 className="text-[5em] p-10 border-2 rounded-[50%] m-2">
                                    100%
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 w-1/2 justify-between">
                            <input
                                type="text"
                                placeholder="Enter Batch"
                                value={batchName}
                                onChange={(e) => setBatchName(e.target.value)}
                                className="border-2 rounded-2xl h-1/3 text-xl p-2"
                            />
                            <input
                                type="text"
                                placeholder="Enter Subject"
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                                className="border-2 rounded-2xl h-1/3 text-xl p-2"
                            />
                            <input
                                type="date"
                                placeholder="Enter Date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="border-2 rounded-2xl h-1/3 text-xl p-2"
                            />
                            <button
                                className="w-full border-2 rounded-lg p-2"
                                onClick={fetchAllStudents}
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Lower Section */}
                    <div className="flex px-4 pb-1 w-full flex-1 overflow-hidden">
                        {/* All Students */}
                        <div className="flex flex-col w-1/2 border-2 rounded-l-xl overflow-hidden">
                            <div className="p-2 border-b-2 flex justify-between items-center">
                                <h2 className="text-lg font-semibold">All Students in Batch</h2>
                                <button
                                    className=" p-2 border-2 rounded-lg bg-green-500 text-white"
                                    onClick={submitAttendance}
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

                        {/* Present Students */}
                        <div className="flex flex-col w-1/2 border-2 rounded-r-xl overflow-hidden">
                            <div className="p-4 border-b-2">
                                <h2 className="text-lg font-semibold">Students Present on Date:</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
                                {fetchedStudents
                                    .filter((student) => presentStudentIds.has(student._id))
                                    .map((student, index) => (
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
