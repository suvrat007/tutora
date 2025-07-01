import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import { useEffect, useState } from "react";
import fetchStudents from "../Student/funtions/HelperFunctions.js";
import { calculateFees } from "./Functions/useFetchAllBatch.jsx";
import CreateEditBatch from "./CreateEditBatch.jsx";

const ViewBatchDetails = ({ viewDetails, setViewDetails, setRerender }) => {
    const [allStudents, setAllStudents] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const batch = viewDetails.batch;

    // const fee = calculateFees(allStudents);

    // useEffect(() => {
    //     const getStudents = async () => {
    //         const students = await fetchStudents(batch._id);
    //         setAllStudents(students);
    //     };
    //     getStudents();
    // }, [batch._id]);

    const handleCloseDetails = () => {
        setViewDetails({ display: false, batch: null });
    };

    const handleEditBatch = () => {
        setShowEditModal(true);
    };

    const handleBatchUpdated = () => {
        setRerender(prev => !prev);
        setShowEditModal(false);
    };

    return (
        <div className="p-4">
            <div className="rounded-2xl border border-gray-200 shadow bg-white flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h1 className="text-xl font-bold text-gray-900">{batch.name}</h1>
                    <div className="flex gap-2">
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
                <div className="flex flex-col lg:flex-row gap-6 p-6 h-80">
                    <div className="flex-1 border rounded-xl shadow-sm bg-white">
                        <div className="sticky top-0 bg-gray-50 p-4 border-b rounded-t-xl">
                            <h2 className="text-lg font-semibold text-gray-800">Batch Details</h2>
                        </div>
                        <div className="space-y-3 p-4 text-sm text-gray-600">
                            <p className="flex gap-2">
                                📚 <span className="font-medium">For Class:</span> {batch.forStandard}
                            </p>
                            <p className="flex gap-2">
                                👥 <span className="font-medium">Total Students:</span> {allStudents.length}
                            </p>
                            <p className="flex gap-2">
                                📝 <span className="font-medium">Total Subjects:</span> {batch.subject.length}
                            </p>
                            <p className="flex gap-2">
                                💰 <span className="font-medium">Total Fee:</span> ₹
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 border rounded-xl shadow-sm bg-white overflow-y-scroll">
                        <div className="sticky top-0 bg-gray-50 p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-800">Subjects & Schedule</h2>
                        </div>
                        {batch.subject?.length > 0 ? (
                            <div className="space-y-4 p-4">
                                {batch.subject.map((item, index) => (
                                    <div key={item._id} className="border-b pb-3 last:border-b-0">
                                        <div className="flex gap-2 font-medium text-sm">
                                            {index + 1}. {item.name.toUpperCase()}
                                        </div>
                                        <div className="ml-6 text-xs text-gray-600 mt-1 space-y-1">
                                            <p className="flex gap-2">
                                                🕒 {item.classSchedule?.time || "N/A"}
                                            </p>
                                            <p className="flex gap-2">
                                                📅 {item.classSchedule?.days?.join(", ") || "No days set"}
                                            </p>
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
                        <div className="flex gap-3 w-1/2">
                            <div className="w-6 text-gray-500 font-medium">#</div>
                            <div className="font-medium">Name</div>
                        </div>
                        <div className="hidden md:flex w-1/2 justify-between text-right text-xs text-gray-600">
                            <div className="w-1/4 font-medium">Grade</div>
                            <div className="w-1/4 font-medium">School</div>
                            <div className="w-1/4 font-medium">Admission</div>
                            <div className="w-1/4 font-medium">Address</div>
                        </div>
                    </div>
                    {allStudents.length === 0 ? (
                        <p className="text-gray-500 text-sm p-4">No students enrolled yet.</p>
                    ) : (
                        <div>
                            {allStudents.map((item, index) => (
                                <div
                                    key={item._id}
                                    className="flex justify-between items-center px-4 py-2 hover:bg-gray-50"
                                >
                                    <div className="flex gap-3 w-1/2">
                                        <div className="w-6 text-gray-500">{index + 1}.</div>
                                        <div className="font-medium truncate">{item.name}</div>
                                    </div>
                                    <div className="hidden md:flex w-1/2 justify-between text-right text-xs gap-2">
                                        <div className="w-1/4 truncate">{item.grade}th</div>
                                        <div className="w-1/4 truncate">{item.school_name}</div>
                                        <div className="w-1/4 truncate">
                                            {new Date(item.admission_date).toLocaleDateString()}
                                        </div>
                                        <div className="w-1/4 truncate">{item.address}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showEditModal && (
                <CreateEditBatch
                    onClose={() => setShowEditModal(false)}
                    onBatchUpdated={handleBatchUpdated}
                    setRerender={setRerender}
                    batchToEdit={batch}
                />
            )}
        </div>
    );
};

export default ViewBatchDetails;