import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { FiPlus } from "react-icons/fi";
import useGetBatchId from "../Student/hooks/useGetBatchId.js";
import AddStudent from "./AddStudent.jsx";
import StdDataDisplay from "./StdDataDisplay.jsx";

const StudentData = () => {
    const [showAddStd, setShowAddStd] = useState(false);
    const [batchName, setBatchName] = useState("");
    const [students, setStudents] = useState([]);
    const [error, setError] = useState("");
    const [formTouched, setFormTouched] = useState(false);
    const { batchId, orgName } = useGetBatchId(batchName);
    const [addedShow, setAddedShow] = useState(false);
    const [seeStdDetails, setSeeStdDetails] = useState(null);
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
            setAddedShow(true)
        } catch (err) {
            console.error("Error fetching students:", err);
            setError("Failed to fetch students. Try again.");
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
    }, []);


console.log(seeStdDetails);

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

                        <div className="flex flex-wrap gap-4 p-2 w-full overflow-y-scroll justify-center">
                            {addedShow && (
                                <li
                                    onClick={() => setShowAddStd(prev => !prev)}
                                    className="w-[22%] cursor-pointer bg-white border border-dashed border-gray-400
                                shadow-md rounded-2xl p-4 flex flex-col items-center space-y-2 hover:shadow-xl transition-shadow duration-300 justify-center"
                                >
                                    <FiPlus className="text-3xl"/>
                                    <span className="text-base font-medium">Add Student</span>
                                </li>
                            )}


                            {students.map((student, index) => (
                                <li
                                    key={index}
                                    className="w-[22%] bg-white border shadow-md rounded-2xl p-4 flex flex-col text-center items-center space-y-2 hover:shadow-xl transition-shadow duration-300"
                                >
                                    <img
                                        src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                                        alt="Student Avatar"
                                        className="w-20 h-20 rounded-full object-cover border"
                                    />
                                    <span className="text-gray-500 text-sm font-semibold">#{index + 1}</span>
                                    <span className="text-lg font-medium"
                                          onClick={()=> setSeeStdDetails({
                                              stdDetails: student,
                                              show: true,
                                          })}>{student.name}</span>
                                    <span className="text-gray-600 text-sm">{student.school_name}</span>
                                </li>
                            ))}
                        </div>
                    </div>

                    {/* Right side: Form */}
                    <div className=" w-full flex flex-col justify-between gap-2 ">
                        {/* Batch Name Input */}
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
                            <StdDataDisplay seeStdDetails={seeStdDetails} setSeeStdDetails={setSeeStdDetails}/>
                        )}

                    </div>
                    {/* Add Student Form */}
                        <div className="border-2 flex flex-col justify-between absolute z-10 background-blur-500">
                        {showAddStd && (
                            <AddStudent
                                batchId={batchId}
                                onStudentAdded={fetchStudents}
                                setShowAddStd={setAddedShow}
                            />
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentData;
