import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import {FiPlus} from "react-icons/fi";
import useGetBatchId from "../Student/hooks/useGetBatchId.js";

const StudentData = () => {
    const [showAddStd, setShowAddStd] = useState(false);
    const [batchName, setBatchName] = useState("");
    const [students, setStudents] = useState([]);
    const [error, setError] = useState("");
    const [formTouched, setFormTouched] = useState(false);

    const [newStudent, setNewStudent] = useState({
        name: "",
        grade: "",
        school_name: "",
        contact_info: {
            emailIds: {
                student: "",
                mom: "",
                dad: ""
            },
            phoneNumbers: {
                student: "",
                mom: "",
                dad: ""
            }
        }
    });

    const {batchId} = useGetBatchId(batchName);

    const fetchStudents = async () => {
        setFormTouched(true);
        setError("");

        if (!batchName) {
            setError("Batch name is required to fetch students.");
            return;
        }
        console.log(batchId);

        try {

            const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
            setStudents(response.data || []);
        } catch (err) {
            console.error("Error fetching students:", err);
            setError("Failed to fetch students. Try again.");
        }
    };

    useEffect(() => {
        const getAllStudents = async () => {
            try{
                const response = await axiosInstance.get(`/get-all-students`);
                console.log(response.data);
                setStudents(response.data || []);
            }catch (error){
                console.log(error.message);
            }
        }
        getAllStudents();
    },[]);

    const addStudent = async () => {
        if (!newStudent.name || !newStudent.email) {
            alert("Please provide student name and email.");
            return;
        }

        try {
            await axiosInstance.post(`/add-student-to-batch/${batchName}`, newStudent);
            setNewStudent({ name: "", email: "" });
            fetchStudents();
        } catch (err) {
            console.error("Error adding student:", err);
            alert("Failed to add student.");
        }
    };

    const deleteStudent = async (studentId) => {
        try {
            await axiosInstance.delete(`/delete-student/${studentId}`);
            fetchStudents();
        } catch (err) {
            console.error("Error deleting student:", err);
            alert("Failed to delete student.");
        }
    };

    return (
        <div className="flex h-screen">
            <SideBar />

            <div className="flex flex-col w-full overflow-hidden">

                <Navbar />

                <div className="flex gap-4 m-2 border-2 h-full">

                    {/*left side*/}
                    <div className="flex flex-col w-[200em] border-2 rounded-2xl p-4 gap-2">
                        <h2 className="text-lg font-semibold">All Students <span>in {batchName}</span> </h2>
                        <div className="flex flex-wrap gap-4 p-2 w-full overflow-y-scroll border-2 justify-center">
                            <>
                                <li
                                    onClick={()=> setShowAddStd(prev=>!prev)}
                                    className="w-[22%] cursor-pointer bg-white border border-dashed border-gray-400
                                    shadow-md rounded-2xl p-4 flex flex-col items-center space-y-2 hover:shadow-xl
                                    transition-shadow duration-300 justify-center"
                                >
                                    <FiPlus className="text-3xl" />
                                    <span className="text-base font-medium" >Add Student</span>
                                </li>

                                {students.map((student, index) => (
                                    <li
                                        key={index}
                                        className="w-[22%] bg-white border shadow-md rounded-2xl p-4 flex flex-col text-center
                                        cursor-pointerflex-col items-center space-y-2 hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <img
                                            src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                                            alt="Student Avatar"
                                            className="w-20 h-20 rounded-full object-cover border"
                                        />
                                        <span className="text-gray-500 text-sm font-semibold">#{index + 1}</span>
                                        <span className="text-lg font-medium">{student.name}</span>
                                        <span className="text-gray-600 text-sm">{student.school_name}</span>
                                    </li>
                                ))}
                            </>

                        </div>

                    </div>

                    {/*right side*/}
                    <div className={'border-2 w-full'}>
                        {/*enter batch name*/}
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

                        {/*add new student*/}
                        {showAddStd && (
                            <div className="flex flex-col border-2 rounded-2xl p-4 gap-4 mt-4">
                                <h2 className="text-lg font-semibold">Add New Student</h2>

                                <input
                                    type="text"
                                    placeholder="Student Name"
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                                    className="border-2 rounded-2xl text-xl p-2"
                                />

                                <input
                                    type="number"
                                    placeholder="Grade"
                                    value={newStudent.grade}
                                    onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                                    className="border-2 rounded-2xl text-xl p-2"
                                />

                                <input
                                    type="text"
                                    placeholder="School Name"
                                    value={newStudent.school_name}
                                    onChange={(e) => setNewStudent({...newStudent, school_name: e.target.value})}
                                    className="border-2 rounded-2xl text-xl p-2"
                                />

                                <input
                                    type="email"
                                    placeholder="Student Email"
                                    value={newStudent.contact_info.emailIds.student}
                                    onChange={(e) =>
                                        setNewStudent({
                                            ...newStudent,
                                            contact_info: {
                                                ...newStudent.contact_info,
                                                emailIds: {
                                                    ...newStudent.contact_info.emailIds,
                                                    student: e.target.value
                                                }
                                            }
                                        })
                                    }
                                    className="border-2 rounded-2xl text-xl p-2"
                                />

                                <input
                                    type="text"
                                    placeholder="Student Phone"
                                    value={newStudent.contact_info.phoneNumbers.student}
                                    onChange={(e) =>
                                        setNewStudent({
                                            ...newStudent,
                                            contact_info: {
                                                ...newStudent.contact_info,
                                                phoneNumbers: {
                                                    ...newStudent.contact_info.phoneNumbers,
                                                    student: e.target.value
                                                }
                                            }
                                        })
                                    }
                                    className="border-2 rounded-2xl text-xl p-2"
                                />

                                <button className="border-2 rounded-lg p-2" onClick={addStudent}>
                                    Add Student
                                </button>
                            </div>

                        )}

                    </div>


                </div>
            </div>
        </div>
    );
};

export default StudentData;
