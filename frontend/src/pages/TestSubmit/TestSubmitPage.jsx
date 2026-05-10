import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/utilities/axiosInstance';

const TestSubmitPage = () => {
    const { testId, groupId } = useParams();
    const isGroup = Boolean(groupId);
    const id = isGroup ? groupId : testId;

    const [testInfo, setTestInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentId, setStudentId] = useState('');
    const [marks, setMarks] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const apiPath = isGroup ? `test/public/group/${id}` : `test/public/${id}`;
                const res = await axiosInstance.get(apiPath);
                setTestInfo(res.data);
            } catch (err) {
                setError(err?.response?.data?.message || 'Test not found or unavailable.');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [id, isGroup]);

    const availableStudents = testInfo?.students?.filter(s => !s.appeared) ?? [];
    const submittedCount = testInfo?.students?.filter(s => s.appeared).length ?? 0;
    const totalCount = testInfo?.students?.length ?? 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (!studentId) { setSubmitError('Please select your name.'); return; }
        const marksNum = Number(marks);
        if (marks === '' || isNaN(marksNum) || marksNum < 0 || marksNum > testInfo.maxMarks) {
            setSubmitError(`Please enter valid marks between 0 and ${testInfo.maxMarks}.`);
            return;
        }
        setSubmitting(true);
        try {
            const apiPath = isGroup ? `test/public/submit/group/${id}` : `test/public/submit/${id}`;
            await axiosInstance.post(apiPath, { studentId, marks: marksNum });
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err?.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8ede3] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#e0c4a8] border-t-[#8b5e3c] rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8ede3] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-lg border border-[#e6c8a8] p-8 max-w-sm w-full text-center">
                    <p className="text-2xl mb-3">📋</p>
                    <h2 className="text-lg font-bold text-[#5a4a3c] mb-2">Test Unavailable</h2>
                    <p className="text-sm text-[#7b5c4b]">{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f8ede3] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-lg border border-[#e6c8a8] p-8 max-w-sm w-full text-center">
                    <p className="text-4xl mb-4">✅</p>
                    <h2 className="text-xl font-bold text-[#5a4a3c] mb-2">Marks Submitted!</h2>
                    <p className="text-sm text-[#7b5c4b]">Your marks have been recorded successfully.</p>
                    <p className="text-xs text-[#b0998a] mt-4">{testInfo.testName}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8ede3] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#e6c8a8] p-6 max-w-sm w-full">
                <div className="mb-5 text-center">
                    {isGroup && (
                        <p className="text-xs font-semibold text-[#b0998a] uppercase tracking-wider mb-1">All Batches</p>
                    )}
                    {!isGroup && testInfo.batchName && (
                        <p className="text-xs font-semibold text-[#b0998a] uppercase tracking-wider mb-1">{testInfo.batchName}</p>
                    )}
                    <h1 className="text-xl font-bold text-[#5a4a3c] mb-1">{testInfo.testName}</h1>
                    <p className="text-sm text-[#7b5c4b]">{formatDate(testInfo.testDate)}</p>
                </div>

                <div className="flex gap-3 mb-5">
                    <div className="flex-1 bg-[#f0d9c0] rounded-2xl p-3 text-center">
                        <p className="text-xs text-[#7b5c4b] mb-0.5">Max Marks</p>
                        <p className="text-xl font-bold text-[#5a4a3c]">{testInfo.maxMarks}</p>
                    </div>
                    {testInfo.passMarks > 0 && (
                        <div className="flex-1 bg-[#f0d9c0] rounded-2xl p-3 text-center">
                            <p className="text-xs text-[#7b5c4b] mb-0.5">Pass Marks</p>
                            <p className="text-xl font-bold text-[#5a4a3c]">{testInfo.passMarks}</p>
                        </div>
                    )}
                    {totalCount > 0 && (
                        <div className="flex-1 bg-[#f0d9c0] rounded-2xl p-3 text-center">
                            <p className="text-xs text-[#7b5c4b] mb-0.5">Submitted</p>
                            <p className="text-xl font-bold text-[#5a4a3c]">{submittedCount}/{totalCount}</p>
                        </div>
                    )}
                </div>

                {availableStudents.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-2xl mb-3">🎉</p>
                        <p className="text-sm font-semibold text-[#5a4a3c]">All students have submitted</p>
                        <p className="text-xs text-[#b0998a] mt-1">No pending submissions</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#5a4a3c] mb-1.5">Your Name</label>
                            <select
                                value={studentId}
                                onChange={e => setStudentId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#e6c8a8] bg-[#f8ede3] text-sm text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8]"
                            >
                                <option value="">Select your name...</option>
                                {availableStudents.map(s => (
                                    <option key={s._id} value={s._id}>
                                        {s.name}{isGroup && s.batchName ? ` — ${s.batchName}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#5a4a3c] mb-1.5">
                                Marks Obtained <span className="font-normal text-[#b0998a]">(out of {testInfo.maxMarks})</span>
                            </label>
                            <input
                                type="number"
                                value={marks}
                                onChange={e => setMarks(e.target.value)}
                                min={0}
                                max={testInfo.maxMarks}
                                placeholder={`0 – ${testInfo.maxMarks}`}
                                className="w-full px-4 py-3 rounded-xl border border-[#e6c8a8] bg-[#f8ede3] text-sm text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8]"
                            />
                        </div>

                        {submitError && (
                            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{submitError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-xl bg-[#5a4a3c] text-white text-sm font-semibold hover:bg-[#4a3a2c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Marks'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TestSubmitPage;
