import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { FiPlus } from "react-icons/fi";
import useGetBatchId from "./funtions/useGetBatchId.js";
import AddStudent from "./AddStudent.jsx";
import StdDataDisplay from "./StdDataDisplay.jsx";
import {AiOutlineClose} from "react-icons/ai";

const StudentData = () => {
    const [showAddStd, setShowAddStd] = useState(false);
    const [batchName, setBatchName] = useState("");
    const [students, setStudents] = useState([]);
    const [error, setError] = useState("");
    const [formTouched, setFormTouched] = useState(false);
    const { batchId, orgName } = useGetBatchId(batchName);
    const [addedShow, setAddedShow] = useState(false);
    const [seeStdDetails, setSeeStdDetails] = useState(null);
    const [rerender, setRerender] = useState(false); // Added for rerendering

    const fetchStudents = async () => {
        setFormTouched(true);
        setError("");

        if (!batchName) {
            setError("Batch name is required to fetch students.");
            return;
        }

        try {
            const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
            setStudents(response.data || []);
            setAddedShow(true);
        } catch (err) {
            console.error("Error fetching students:", err);
            setError("Failed to fetch students. Try again.");
        }
    };

    const deleteStudent = async (studentId) => {
        const confirmDelete = window.confirm(
            "This will delete this student from the database... do you want to continue?"
        );
        if (!confirmDelete) return;

        try {
            const response = await axiosInstance.delete(`/delete-student/${studentId}`);
            if (response.status !== 200) {
                throw new Error('Failed to delete the student');
            }

            alert('Student successfully deleted.');
            setRerender(prev => !prev); // Trigger rerender
            fetchStudents(); // Refresh student list
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('An error occurred while deleting the student.');
        }
    };

    useEffect(() => {
        const getAllStudents = async () => {
            try {
                const response = await axiosInstance.get(`/get-all-students`);
                setStudents(response.data || []);
            } catch (error) {
                console.log(error.message);
            }
        };
        getAllStudents();
        if (batchId) {
            fetchStudents(); // Fetch students when batchId changes
        }
    }, [batchId, rerender]); // Rerender dependency

    return (
        <div className="flex h-screen">
            <SideBar />
            <div className="flex flex-col w-full overflow-hidden">
                <Navbar />
                <div className="flex gap-4 m-2 overflow-hidden h-full">
                    {/* Left side: Student Cards */}
                    <div className="flex flex-col w-[200em] border-2 rounded-2xl p-4 gap-2 h-full">
                        <h2 className="text-lg font-semibold border-b pb-3 z-10 bg-white/60 backdrop-blur-md">
                            All Students in <span>{orgName || "Org Name"}</span>
                        </h2>
                        <div className="flex flex-wrap gap-4 p-2 w-full border-2 h-full overflow-y-scroll justify-center">
                            {addedShow && (
                                <li
                                    onClick={() => setShowAddStd(prev => !prev)}
                                    className="w-[12em] h-[15em] cursor-pointer bg-white border border-dashed border-gray-400
                                    shadow-md rounded-2xl p-4 flex flex-col items-center space-y-2 hover:shadow-xl
                                    transition-shadow duration-300 justify-center"
                                >
                                    <FiPlus className="text-3xl"/>
                                    <span className="text-base font-medium">Add Student</span>
                                </li>
                            )}
                            {students.map((student, index) => (
                                <div
                                    key={student._id} // Use unique _id for key
                                    onClick={() => setSeeStdDetails({
                                        stdDetails: student,
                                        show: true,
                                    })}
                                    className="relative w-[12em] h-[15em] cursor-pointer hover:underline bg-white border
                                    shadow-md rounded-2xl p-4 hover:shadow-xl transition-shadow duration-300 flex flex-col
                                    items-center justify-center"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteStudent(student?._id);
                                        }}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition"
                                    >
                                        <AiOutlineClose size={20} />
                                    </button>
                                    <div className="flex flex-col items-center text-center space-y-2 mt-4">
                                        <img
                                            src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                                            alt="Student Avatar"
                                            className="w-20 h-20 rounded-full object-cover border"
                                        />
                                        <span className="text-gray-500 text-sm font-semibold">#{index + 1}</span>
                                        <span className="text-lg font-medium">{student.name}</span>
                                        <span className="text-gray-600 text-sm">{student.school_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Right side: Form */}
                    <div className="w-full flex flex-col justify-between gap-2">
                        <div className="flex flex-col gap-3 p-4 border-2 rounded-2xl">
                            <h2 className="text-xl font-bold">Manage Students by Batch</h2>
                            <input
                                type="text"
                                placeholder="Enter Batch Name"
                                value={batchName}
                                onChange={(e) => setBatchName(e.target.value)}
                                className="border-2 rounded-2xl text-xl p-2"
                            />
                            {formTouched && !batchName && <p className="text-red-500">Batch is required.</p>}
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <button className="border-2 rounded-lg p-2" onClick={fetchStudents}>Search</button>
                        </div>
                        {seeStdDetails?.show && (
                            <StdDataDisplay
                                seeStdDetails={seeStdDetails}
                                setSeeStdDetails={setSeeStdDetails}
                                onStudentEdited={() => setRerender(prev => !prev)} // Pass callback for edit
                            />
                        )}
                    </div>
                    <div className="border-2 flex flex-col justify-between absolute z-10 background-blur-500">
                        {showAddStd && (
                            <AddStudent
                                batchId={batchId}
                                onStudentAdded={() => {
                                    fetchStudents();
                                    setRerender(prev => !prev); // Trigger rerender
                                }}
                                setShowAddStd={setShowAddStd}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentData;
