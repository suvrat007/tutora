import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiFilter, FiLink } from 'react-icons/fi';
import { Clock, Layers } from 'lucide-react';
import axiosInstance from '../../utilities/axiosInstance';
import { API, TEST_STATUS } from '../../utilities/constants';
import { formatDateTime } from '../../utilities/dateUtils';
import { removeTestById, removeTestsByGroupId } from '../../utilities/redux/testSlice';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Dropdown from '@/components/ui/Dropdown';
import toast from 'react-hot-toast';

const statusColors = {
    [TEST_STATUS.SCHEDULED]:  'bg-blue-100 text-blue-700',
    [TEST_STATUS.COMPLETED]:  'bg-green-100 text-green-700',
    [TEST_STATUS.CANCELLED]:  'bg-red-100 text-red-700',
};

const isOverdue = (test) =>
    test.status === TEST_STATUS.SCHEDULED && new Date(test.testDate) < new Date();

const isFutureScheduled = (test) =>
    test.status === TEST_STATUS.SCHEDULED && new Date(test.testDate) >= new Date();

const hasNoResults = (test) =>
    test.status === TEST_STATUS.COMPLETED &&
    (!test.studentResults?.length || test.studentResults.every(r => !r.appeared));

const PAGE_SIZE = 6;

const TestList = ({ batches, tests, setEditingTest, setSelectedTest, fetchTests, loading }) => {
    const dispatch = useDispatch();
    const [testToDelete, setTestToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [batchFilter, setBatchFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const subjectOptions = batchFilter
        ? (batches.find(b => b._id === batchFilter)?.subject || [])
        : [];

    // Build display list: one card per groupId, individual cards for ungrouped tests
    const displayList = useMemo(() => {
        const groups = {};
        const ungrouped = [];
        tests.forEach(t => {
            if (t.groupId) {
                if (!groups[t.groupId]) groups[t.groupId] = [];
                groups[t.groupId].push(t);
            } else {
                ungrouped.push(t);
            }
        });
        const groupCards = Object.values(groups).map(g => ({
            ...g[0],
            _isGroup: true,
            _groupTests: g,
            _totalStudents: g.reduce((s, t) => s + (t.studentResults?.length || 0), 0),
        }));
        return [...groupCards, ...ungrouped].sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
    }, [tests]);

    const filteredTests = displayList.filter(t => {
        if (batchFilter) {
            if (t._isGroup) return false; // group tests span all batches
            if (t.batchId !== batchFilter) return false;
        }
        if (subjectFilter && t.subjectId !== subjectFilter) return false;
        if (statusFilter && t.status !== statusFilter) return false;
        if (dateFrom && new Date(t.testDate) < new Date(dateFrom)) return false;
        if (dateTo && new Date(t.testDate) > new Date(dateTo + 'T23:59:59')) return false;
        return true;
    });

    const resetFilters = () => {
        setBatchFilter(''); setSubjectFilter(''); setStatusFilter('');
        setDateFrom(''); setDateTo('');
    };
    const hasFilters = batchFilter || subjectFilter || statusFilter || dateFrom || dateTo;

    useEffect(() => { setPage(1); }, [tests.length, batchFilter, subjectFilter, statusFilter, dateFrom, dateTo]);
    useEffect(() => { setSubjectFilter(''); }, [batchFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredTests.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pagedTests = filteredTests.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
            if (testToDelete.groupId) {
                const groupTests = tests.filter(t => t.groupId === testToDelete.groupId);
                await Promise.all(groupTests.map(t => axiosInstance.delete(API.DELETE_TEST(t._id))));
                dispatch(removeTestsByGroupId(testToDelete.groupId));
            } else {
                await axiosInstance.delete(API.DELETE_TEST(testToDelete.testId));
                dispatch(removeTestById(testToDelete.testId));
            }
            toast.success('Test deleted');
        } catch (error) {
            console.error('Failed to delete test', error);
            toast.error('Failed to delete test');
        } finally {
            setDeleting(false);
            setTestToDelete(null);
        }
    };

    return (
        <>
            <div>
                <div className="sticky top-0 z-[100] bg-[#f0d9c0] pt-3 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.07)] mb-3 rounded-2xl px-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-[#5a4a3c]">Scheduled Tests</h2>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="p-1.5 rounded-lg border border-[#e6c8a8] bg-white text-[#5a4a3c] hover:bg-[#e0c4a8] disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <FiChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-[#7b5c4b] font-medium">{safePage} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="p-1.5 rounded-lg border border-[#e6c8a8] bg-white text-[#5a4a3c] hover:bg-[#e0c4a8] disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <div className="w-36">
                        <Dropdown
                            value={batchFilter}
                            onChange={e => setBatchFilter(e.target.value)}
                            options={[{ label: 'All Batches', value: '' }, ...batches.map(b => ({ label: b.name, value: b._id }))]}
                        />
                    </div>
                    <div className="w-36">
                        <Dropdown
                            value={subjectFilter}
                            onChange={e => setSubjectFilter(e.target.value)}
                            disabled={!batchFilter}
                            options={[{ label: 'All Subjects', value: '' }, ...subjectOptions.map(s => ({ label: s.name, value: s._id }))]}
                        />
                    </div>
                    <div className="w-36">
                        <Dropdown
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            options={[
                                { label: 'All Statuses', value: '' },
                                { label: 'Scheduled', value: TEST_STATUS.SCHEDULED },
                                { label: 'Completed', value: TEST_STATUS.COMPLETED },
                                { label: 'Cancelled', value: TEST_STATUS.CANCELLED },
                            ]}
                        />
                    </div>
                    <div className="w-36">
                        <input
                            type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            max={dateTo || undefined}
                            className="w-full px-4 py-2.5 rounded-full border border-[#e6c8a8] bg-white text-sm text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] shadow-sm"
                        />
                    </div>
                    <div className="w-36">
                        <input
                            type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            min={dateFrom || undefined}
                            className="w-full px-4 py-2.5 rounded-full border border-[#e6c8a8] bg-white text-sm text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] shadow-sm"
                        />
                    </div>
                    {hasFilters && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-1.5 rounded-full border border-[#e6c8a8] bg-[#f0d9c0] text-sm text-[#7b5c4b] hover:bg-[#e0c4a8] transition"
                        >
                            Clear
                        </button>
                    )}
                </div>
                </div>{/* end sticky */}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="p-3 rounded-2xl bg-[#f0d9c0]/50 shadow-sm animate-pulse h-[140px] border border-[#e6c8a8]" />
                        ))}
                    </div>
                ) : filteredTests.length === 0 ? (
                    <div className="bg-[#f0d9c0] p-8 rounded-xl text-center text-[#7b5c4b] border border-[#e6c8a8] border-dashed">
                        <p className="font-medium">{tests.length === 0 ? 'No tests found.' : 'No tests match the selected filters.'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <AnimatePresence mode="popLayout">
                            {pagedTests.map((test, i) => (
                                <motion.div
                                    key={test.groupId || test._id}
                                    layout
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-3 border border-[#e6c8a8] rounded-2xl bg-[#f8ede3] shadow-sm transition-all ${isFutureScheduled(test) ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md hover:bg-[#f0d9c0] cursor-pointer'}`}
                                    onClick={() => {
                                        if (isFutureScheduled(test)) {
                                            toast("Results can only be entered after the test date.", {
                                                icon: <Clock className="w-4 h-4" style={{ color: "#c47d3e" }} />,
                                                duration: 3000,
                                            });
                                        } else {
                                            setSelectedTest(test);
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className="font-bold text-[#5a4a3c] text-sm leading-snug pr-2">{test.testName}</h3>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                                                isOverdue(test)
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : statusColors[test.status] || 'bg-[#f0d9c0] text-[#7b5c4b]'
                                            }`}>
                                                {isOverdue(test) ? 'Needs Update' : test.status}
                                            </span>
                                            {hasNoResults(test) && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-600 whitespace-nowrap">
                                                    Results not added
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {test._isGroup ? (
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <Layers className="w-3 h-3 text-[#8b5e3c]" />
                                            <span className="text-xs font-semibold text-[#8b5e3c]">All Batches</span>
                                            <span className="text-xs text-[#b0998a]">· {test._groupTests.length} batches · {test._totalStudents} students</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[#7b5c4b] mb-0.5">{getBatchName(test.batchId)}</p>
                                    )}
                                    {!test._isGroup && <p className="text-xs text-[#7b5c4b] mb-0.5">{getSubjectName(test.batchId, test.subjectId)}</p>}
                                    <p className="text-xs text-[#7b5c4b] mb-0.5">{formatDateTime(test.testDate)}</p>
                                    <p className="text-xs text-[#7b5c4b]">Max: <span className="font-semibold text-[#5a4a3c]">{test.maxMarks}</span>{test.passMarks > 0 && <span> &middot; Pass: <span className="font-semibold text-[#5a4a3c]">{test.passMarks}</span></span>}</p>
                                    <div className="mt-2 flex gap-2" onClick={e => e.stopPropagation()}>
                                        {isFutureScheduled(test) ? (
                                            <button
                                                onClick={() => setEditingTest(test)}
                                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#5a4a3c] bg-[#e0c4a8] rounded-lg hover:bg-[#d8bca0] transition-colors"
                                            >
                                                <FiEdit2 className="w-3 h-3" /> Edit
                                            </button>
                                        ) : (
                                        <button
                                            onClick={() => setSelectedTest(test)}
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#5a4a3c] bg-[#e0c4a8] rounded-lg hover:bg-[#d8bca0] transition-colors"
                                        >
                                            <FiEdit2 className="w-3 h-3" /> Results
                                        </button>
                                        )}
                                        <button
                                            onClick={() => setTestToDelete(
                                                test._isGroup
                                                    ? { groupId: test.groupId }
                                                    : { testId: test._id, batchId: test.batchId }
                                            )}
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <FiTrash2 className="w-3 h-3" /> Delete
                                        </button>
                                        {test.status !== 'cancelled' && (
                                            <button
                                                onClick={() => {
                                                    const url = test._isGroup
                                                        ? `${window.location.origin}/test-submit/group/${test.groupId}`
                                                        : `${window.location.origin}/test-submit/${test._id}`;
                                                    navigator.clipboard.writeText(url);
                                                    toast.success('Link copied!');
                                                }}
                                                title="Copy student submission link"
                                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#7b5c4b] bg-[#f0d9c0] rounded-lg hover:bg-[#e0c4a8] transition-colors"
                                            >
                                                <FiLink className="w-3 h-3" />
                                            </button>
                                        )}
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
