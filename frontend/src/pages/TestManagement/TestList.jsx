import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import axiosInstance from '../../utilities/axiosInstance';
import { API, TEST_STATUS } from '../../utilities/constants';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const statusColors = {
    [TEST_STATUS.SCHEDULED]:  'bg-blue-100 text-blue-700',
    [TEST_STATUS.COMPLETED]:  'bg-green-100 text-green-700',
    [TEST_STATUS.CANCELLED]:  'bg-red-100 text-red-700',
};

const TestList = ({ batches, tests, setEditingTest, setSelectedTest, fetchTests }) => {
    const [testToDelete, setTestToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const getSubjectName = (batchId, subjectId) => {
        const batch = batches.find(b => b._id === batchId);
        if (batch && subjectId) {
            const subject = batch.subject.find(s => s._id === subjectId);
            return subject ? subject.name : 'No Subject';
        }
        return 'No Subject';
    };

    const getBatchName = (batchId) => {
        const batch = batches.find(b => b._id === batchId);
        return batch ? batch.name : 'Unknown Batch';
    };

    const handleConfirmDelete = async () => {
        if (!testToDelete) return;
        setDeleting(true);
        try {
            await axiosInstance.delete(API.DELETE_TEST(testToDelete.testId));
            fetchTests(testToDelete.batchId);
        } catch (error) {
            console.error('Failed to delete test', error);
        } finally {
            setDeleting(false);
            setTestToDelete(null);
        }
    };

    return (
        <>
            <div className="mt-4">
                <h2 className="text-xl font-bold text-[#5a4a3c] mb-4">Scheduled Tests</h2>
                {tests.length === 0 ? (
                    <div className="bg-[#f0d9c0] p-8 rounded-xl text-center text-[#7b5c4b] border border-[#e6c8a8] border-dashed">
                        <p className="font-medium">No tests found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {tests.map((test, i) => (
                                <motion.div
                                    key={test._id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                    exit={{ opacity: 0, y: -16 }}
                                    className="p-4 border border-[#e6c8a8] rounded-2xl bg-[#f8ede3] shadow-sm hover:shadow-md hover:bg-[#f0d9c0] transition-all cursor-pointer"
                                    onClick={() => setSelectedTest(test)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-[#5a4a3c] text-sm leading-snug pr-2">{test.testName}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 capitalize ${statusColors[test.status] || 'bg-[#f0d9c0] text-[#7b5c4b]'}`}>
                                            {test.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#7b5c4b] mb-0.5">{getBatchName(test.batchId)}</p>
                                    <p className="text-xs text-[#7b5c4b] mb-0.5">{getSubjectName(test.batchId, test.subjectId)}</p>
                                    <p className="text-xs text-[#7b5c4b] mb-0.5">{new Date(test.testDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    <p className="text-xs text-[#7b5c4b]">Max: <span className="font-semibold text-[#5a4a3c]">{test.maxMarks}</span>{test.passMarks > 0 && <span> &middot; Pass: <span className="font-semibold text-[#5a4a3c]">{test.passMarks}</span></span>}</p>
                                    <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => setEditingTest(test)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#5a4a3c] bg-[#e0c4a8] rounded-lg hover:bg-[#d8bca0] transition-colors"
                                        >
                                            <FiEdit2 className="w-3 h-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => setTestToDelete({ testId: test._id, batchId: test.batchId })}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <FiTrash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {testToDelete && (
                    <ConfirmationModal
                        message="Delete this test? This cannot be undone."
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setTestToDelete(null)}
                        isLoading={deleting}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default TestList;
