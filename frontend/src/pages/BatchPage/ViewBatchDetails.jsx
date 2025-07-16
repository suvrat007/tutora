import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import { useEffect, useState } from "react";
import CreateEditBatch from "./CreateEditBatch.jsx";
import AddStudentModal from "@/pages/BatchPage/AddStudentModal.jsx";
import useFetchStudents from "@/pages/useFetchStudents.js";

const ViewBatchDetails = ({ viewDetails, setViewDetails, setRerender }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [students, setStudents] = useState(viewDetails.studentsForBatch);
    const fetchStudents = useFetchStudents();

    const batch = viewDetails.batch;

    const handleCloseDetails = () => {
        setViewDetails({ display: false, batch: null, studentsForBatch: null });
    };

    const handleEditBatch = () => {
        setShowEditModal(true);
    };

    const handleBatchUpdated = () => {
        setRerender(prev => !prev);
        setShowEditModal(false);
    };

    const refreshStudents = async () => {
        await fetchStudents(); // Refresh redux store
        const updatedBatch = JSON.parse(JSON.stringify(viewDetails.batch)); // Get fresh props if required
        const newGrouped = JSON.parse(localStorage.getItem("reduxState"))?.students?.groupedStudents || [];
        const foundGroup = newGrouped.find(group => group.batchId === updatedBatch._id);
        if (foundGroup) setStudents(foundGroup.students);
    };

    const getTotalFee = () => {
        return students.reduce((sum, student) => sum + (student.fee_status.amount || 0), 0);
    };

    return (
        <>
            <div className="rounded-2xl shadow bg-white flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h1 className="text-xl font-bold text-gray-900">{batch.name}</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddStudentModal(true)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Add Students
                        </button>
                        <button
                            onClick={handleEditBatch}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <AiOutlineEdit className="text-lg" />
                            Edit
                        </button>
                        <button
                            onClick={handleCloseDetails}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <AiOutlineClose className="text-lg" />
                            Go Back
                        </button>
                    </div>
                </div>

                {/* Batch Details */}
                <div className="flex flex-col lg:flex-row gap-6 p-6 h-80">
                    <div className="flex-1 border rounded-xl shadow-sm bg-white">
                        <div className="sticky top-0 bg-gray-50 p-4 border-b rounded-t-xl">
                            <h2 className="text-lg font-semibold text-gray-800">Batch Details</h2>
                        </div>
                        <div className="space-y-3 p-4 text-sm text-gray-600">
                            <p>📚 <b>For Class:</b> {batch.forStandard}</p>
                            <p>👥 <b>Total Students:</b> {students.length}</p>
                            <p>📝 <b>Total Subjects:</b> {batch.subject.length}</p>
                            <p>💰 <b>Total Fee:</b> ₹{getTotalFee()}</p>
                        </div>
                    </div>

                    {/* Subject Schedule */}
                    <div className="flex-1 border rounded-xl shadow-sm bg-white overflow-y-scroll">
                        <div className="sticky top-0 bg-gray-50 p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-800">Subjects & Schedule</h2>
                        </div>
                        {batch.subject.length > 0 ? (
                            <div className="space-y-4 p-4">
                                {batch.subject.map((subj, index) => (
                                    <div key={subj._id} className="border-b pb-3 last:border-b-0">
                                        <div className="font-medium text-sm">
                                            {index + 1}. {subj.name.toUpperCase()}
                                        </div>
                                        <div className="ml-6 text-xs text-gray-600 mt-1">
                                            🕒 {subj.classSchedule?.time || "N/A"}<br />
                                            📅 {subj.classSchedule?.days?.join(", ") || "No days set"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm p-4">No subjects added yet.</p>
                        )}
                    </div>
                </div>

                <div className="border rounded-xl shadow-sm bg-white m-6 mt-0 h-60 overflow-y-auto">
                    <div className="sticky top-0 bg-gray-50 p-4 border-b flex justify-between">
                        <div className="w-1/2 flex gap-3">
                            <div className="w-6 font-medium text-gray-500">#</div>
                            <div className="font-medium">Name</div>
                        </div>
                        <div className="hidden md:flex w-1/2 justify-between text-xs text-gray-600">
                            <div className="w-1/4 font-medium">Grade</div>
                            <div className="w-1/4 font-medium">School</div>
                            <div className="w-1/4 font-medium">Admission</div>
                            <div className="w-1/4 font-medium">Address</div>
                        </div>
                    </div>

                    {students.length === 0 ? (
                        <p className="text-gray-500 text-sm p-4">No students enrolled yet.</p>
                    ) : (
                        students.map((item, index) => (
                            <div key={item._id} className="flex justify-between px-4 py-2 hover:bg-gray-50">
                                <div className="w-1/2 flex gap-3">
                                    <div className="w-6 text-gray-500">{index + 1}.</div>
                                    <div className="truncate font-medium">{item.name}</div>
                                </div>
                                <div className="hidden md:flex w-1/2 text-xs gap-2 text-right">
                                    <div className="w-1/4 truncate">{item.grade}th</div>
                                    <div className="w-1/4 truncate">{item.school_name}</div>
                                    <div className="w-1/4 truncate">{new Date(item.admission_date).toLocaleDateString()}</div>
                                    <div className="w-1/4 truncate">{item.address}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            {showEditModal && (
                <CreateEditBatch
                    onClose={() => setShowEditModal(false)}
                    onBatchUpdated={handleBatchUpdated}
                    setRerender={setRerender}
                    batchToEdit={batch}
                />
            )}
            {showAddStudentModal && (
                <AddStudentModal
                    batch={batch}
                    onClose={() => setShowAddStudentModal(false)}
                    setRerender={setRerender}
                    refreshStudents={refreshStudents}
                />
            )}
        </>
    );
};

export default ViewBatchDetails;
