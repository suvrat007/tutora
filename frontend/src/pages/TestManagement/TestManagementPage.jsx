import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import TestScheduleForm from './TestScheduleForm';
import TestList from './TestList';
import axiosInstance from '../../utilities/axiosInstance';
import { mergeTests, setTests } from '../../utilities/redux/testSlice';
import { API } from '../../utilities/constants';
import useFetchStudents from '@/hooks/useFetchStudents';
import WrapperCard from '@/components/ui/WrapperCard';

const TestDetail = lazy(() => import('./TestDetail'));

const TestManagementPage = () => {
    const dispatch = useDispatch();
    const batches = useSelector(state => state.batches) || [];
    const tests = useSelector(state => state.tests.tests) || [];
    const groupedStudents = useSelector(state => state.students.groupedStudents) || [];
    const fetchGroupedStudents = useFetchStudents();

    const [editingTest, setEditingTest] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);

    const handleSelectTest = (test) => {
        if (!test._isGroup) { setSelectedTest(test); return; }
        // Build a merged test with all studentResults tagged by their source testId
        const merged = {
            ...test,
            studentResults: test._groupTests.flatMap(gt =>
                (gt.studentResults || []).map(r => ({ ...r, _testId: gt._id, _batchId: gt.batchId }))
            ),
        };
        setSelectedTest(merged);
    };
    const detailRef = useRef(null);

    useEffect(() => {
        if (!groupedStudents.length) fetchGroupedStudents();
    }, [groupedStudents.length, fetchGroupedStudents]);

    const fetchTests = async (batchId) => {
        try {
            const url = batchId ? `${API.GET_ALL_TESTS}?batchId=${batchId}` : API.GET_ALL_TESTS;
            const res = await axiosInstance.get(url);
            dispatch(batchId ? mergeTests(res.data.data) : setTests(res.data.data));
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
        <div className="p-4 h-full overflow-hidden flex flex-col">
            <WrapperCard>
                <div className="bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-4 sm:p-6 bg-[#f0d9c0] border-b border-[#e6c8a8] shrink-0">
                        <h1 className="text-2xl font-bold text-[#5a4a3c]">Test Management</h1>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col lg:flex-row flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-[#e6c8a8]">
                        {/* LEFT: Schedule new test form */}
                        <div className="lg:w-[320px] shrink-0 p-4 sm:p-6 overflow-y-auto">
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

                        {/* RIGHT: Test list + detail, scrolls together */}
                        <div className="flex-1 min-w-0 px-4 sm:px-6 pt-3 pb-6 overflow-y-auto flex flex-col gap-4">
                            <TestList
                                batches={batches}
                                tests={tests}
                                setEditingTest={setEditingTest}
                                setSelectedTest={handleSelectTest}
                                fetchTests={fetchTests}
                            />
                            {/* Test detail inline */}
                            <div ref={detailRef}>
                                {selectedTest && (
                                    <Suspense fallback={
                                        <div className="animate-pulse bg-[#f0d9c0] rounded-2xl h-40 border border-[#e6c8a8]" />
                                    }>
                                        <TestDetail test={selectedTest} fetchTests={fetchTests} setEditingTest={setEditingTest} />
                                    </Suspense>
                                )}
                            </div>
                        </div>
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
