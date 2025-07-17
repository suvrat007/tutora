import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import { useState } from "react";
import CreateEditBatch from "./CreateEditBatch.jsx";
import AddStudentModal from "@/pages/BatchPage/AddStudentModal.jsx";
import useFetchStudents from "@/pages/useFetchStudents.js";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button.jsx";

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

    const refreshStudents = async () => {
        await fetchStudents();
        const updatedBatch = JSON.parse(JSON.stringify(viewDetails.batch));
        const newGrouped = JSON.parse(localStorage.getItem("reduxState"))?.students?.groupedStudents || [];
        const foundGroup = newGrouped.find(group => group.batchId === updatedBatch._id);
        if (foundGroup) setStudents(foundGroup.students);
    };

    const getTotalFee = () => {
        return students.reduce((sum, student) => sum + (student.fee_status.amount || 0), 0);
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl shadow-soft bg-white flex flex-col border border-border">
                <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-background">
                    <h1 className="text-xl font-bold text-text">{batch.name}</h1>
                    <div className="flex gap-2">
                        <Button onClick={() => setShowAddStudentModal(true)} size="sm">Add Students</Button>
                        <Button onClick={handleEditBatch} size="sm" variant="outline"><AiOutlineEdit className="mr-1" /> Edit</Button>
                        <Button onClick={handleCloseDetails} size="sm" variant="outline"><AiOutlineClose className="mr-1" /> Go Back</Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 p-6">
                    <div className="flex-1 border border-border rounded-xl shadow-soft bg-white p-4">
                        <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
                            <FaUser className="w-5 h-5 mr-2 text-primary"/>
                            General Information
                        </h2>
                        <div className="space-y-3 text-text-light">
                            <div className="flex items-center">
                                <span className="font-medium w-20">Name:</span>
                                <span className="text-text">{student.studentName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium w-20">Grade:</span>
                                <span className="text-text">{student.grade || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium w-20">Batch:</span>
                                <span className="text-text">{student.batchName || 'N/A'}</span>
                            </div>
                            <div className="flex items-start">
                                <span className="font-medium w-20">Subjects:</span>
                                <span className="text-text">{student.subjects || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 border border-border rounded-xl shadow-soft bg-white p-4">
                        <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
                            <FaSchool className="w-5 h-5 mr-2 text-primary"/>
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <span className="font-medium text-text-light block">School:</span>
                                    <span className="text-text text-sm">{student.school_name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-text-light block">Admission Date:</span>
                                    <span className="text-text text-sm">{new Date(student.admission_date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-text-light block">Student Phone:</span>
                                    <span className="text-text text-sm">{student.contact_info?.phoneNumbers?.student || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <span className="font-medium text-text-light block">Mom Phone:</span>
                                    <span className="text-text text-sm">{student.contact_info?.phoneNumbers?.mom || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-text-light block">Dad Phone:</span>
                                    <span className="text-text text-sm">{student.contact_info?.phoneNumbers?.dad || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-text-light block">Student Email:</span>
                                    <span className="text-text text-sm">{student.contact_info?.emailIds?.student || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-2xl shadow-soft p-6 flex flex-col items-center justify-center border border-border">
                        <h2 className="text-xl font-semibold text-text mb-4">Attendance Summary</h2>
                        <AttendanceChart percentage={attendanceStats.percentage}/>
                        <div className="mt-4 text-center">
                            <div className="text-sm text-text-light">
                                Present: {attendanceStats.present} / Total: {attendanceStats.total}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-xl shadow-soft bg-white m-6 mt-0 overflow-y-auto">
                    <div className="sticky top-0 bg-background p-4 border-b border-border flex justify-between">
                        <div className="w-1/2 flex gap-3">
                            <div className="w-6 font-medium text-text-light">#</div>
                            <div className="font-medium">Name</div>
                        </div>
                        <div className="hidden md:flex w-1/2 justify-between text-xs text-text-light">
                            <div className="w-1/4 font-medium">Grade</div>
                            <div className="w-1/4 font-medium">School</div>
                            <div className="w-1/4 font-medium">Admission</div>
                            <div className="w-1/4 font-medium">Address</div>
                        </div>
                    </div>
                    <AnimatePresence>
                        {students.length === 0 ? (
                            <p className="text-text-light text-sm p-4">No students enrolled yet.</p>
                        ) : (
                            students.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex justify-between px-4 py-2 hover:bg-background"
                                >
                                    <div className="w-1/2 flex gap-3">
                                        <div className="w-6 text-text-light">{index + 1}.</div>
                                        <div className="truncate font-medium">{item.name}</div>
                                    </div>
                                    <div className="hidden md:flex w-1/2 text-xs gap-2 text-right">
                                        <div className="w-1/4 truncate">{item.grade}th</div>
                                        <div className="w-1/4 truncate">{item.school_name}</div>
                                        <div className="w-1/4 truncate">{new Date(item.admission_date).toLocaleDateString()}</div>
                                        <div className="w-1/4 truncate">{item.address}</div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <AnimatePresence>
                {showEditModal && (
                    <CreateEditBatch
                        onClose={() => setShowEditModal(false)}
                        onBatchUpdated={() => setRerender(prev => !prev)}
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
            </AnimatePresence>
        </>
    );
};

export default ViewBatchDetails;