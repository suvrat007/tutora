import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import TestScheduleForm from './TestScheduleForm';
import TestList from './TestList';
import axiosInstance from '../../utilities/axiosInstance';
import { mergeTests } from '../../utilities/redux/testSlice';
import { API } from '../../utilities/constants';
import useFetchStudents from '../useFetchStudents';
import WrapperCard from '@/utilities/WrapperCard';

const TestDetail = lazy(() => import('./TestDetail'));

const TestManagementPage = () => {
    const dispatch = useDispatch();
    const batches = useSelector(state => state.batches) || [];
    const tests = useSelector(state => state.tests.tests) || [];
    const groupedStudents = useSelector(state => state.students.groupedStudents) || [];
    const fetchGroupedStudents = useFetchStudents();

    const [editingTest, setEditingTest] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const detailRef = useRef(null);

    useEffect(() => {
        if (!groupedStudents.length) fetchGroupedStudents();
    }, [groupedStudents.length, fetchGroupedStudents]);

    const fetchTests = async (batchId) => {
        if (!batchId) return;
        try {
            const res = await axiosInstance.get(`${API.GET_ALL_TESTS}?batchId=${batchId}`);
            dispatch(mergeTests(res.data.data));
        } catch (error) {
            console.error('Failed to fetch tests', error);
        }
    };

    useEffect(() => {
        batches.forEach(batch => fetchTests(batch._id));
    }, [batches]);

    useEffect(() => {
        if (selectedTest) {
            setTimeout(() => {
                detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }
    }, [selectedTest]);

    return (
        <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
            <WrapperCard>
                <div className="bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden">
                    <div className="p-4 sm:p-6 bg-[#f0d9c0] border-b border-[#e6c8a8]">
                        <h1 className="text-2xl font-bold text-[#5a4a3c]">Test Management</h1>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#e6c8a8]">
                        {/* LEFT: Schedule new test form */}
                        <div className="lg:w-[320px] shrink-0 p-4 sm:p-6">
                            <h2 className="text-base font-bold text-[#5a4a3c] mb-4">Schedule a New Test</h2>
                            <div className="bg-white border border-[#e6c8a8] rounded-2xl p-4 shadow-sm">
                                <TestScheduleForm
                                    key="create"
                                    batches={batches}
                                    editingTest={null}
                                    setEditingTest={() => {}}
                                    fetchTests={fetchTests}
                                    showTitle={false}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Scheduled tests list */}
                        <div className="flex-1 min-w-0 p-4 sm:p-6">
                            <TestList
                                batches={batches}
                                tests={tests}
                                setEditingTest={setEditingTest}
                                setSelectedTest={setSelectedTest}
                                fetchTests={fetchTests}
                            />
                        </div>
                    </div>

                    {/* BOTTOM: Test detail panel */}
                    <div ref={detailRef} className="px-4 sm:px-6 pb-6">
                        {selectedTest && (
                            <Suspense fallback={
                                <div className="animate-pulse bg-[#f0d9c0] rounded-2xl h-40 border border-[#e6c8a8]" />
                            }>
                                <TestDetail test={selectedTest} fetchTests={fetchTests} setEditingTest={setEditingTest} />
                            </Suspense>
                        )}
                    </div>
                </div>
            </WrapperCard>

            {/* Edit test modal */}
            <AnimatePresence>
                {editingTest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                        onClick={() => setEditingTest(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#f8ede3] rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-[#e6c8a8]"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-[#5a4a3c]">Edit Test</h3>
                                <button
                                    onClick={() => setEditingTest(null)}
                                    className="text-[#7b5c4b] hover:text-[#5a4a3c] transition-colors"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                            <TestScheduleForm
                                key={editingTest._id}
                                batches={batches}
                                editingTest={editingTest}
                                setEditingTest={setEditingTest}
                                fetchTests={fetchTests}
                                showTitle={false}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestManagementPage;
