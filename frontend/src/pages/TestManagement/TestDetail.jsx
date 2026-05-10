import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utilities/axiosInstance';
import { Input } from '../../components/ui/input';
import { API, TEST_STATUS } from '../../utilities/constants';
import { FiSettings } from 'react-icons/fi';
import { Ban } from 'lucide-react';
import { formatDateTime } from '../../utilities/dateUtils';

const DETAIL_PAGE_SIZE = 10;

const TestDetail = ({ test, fetchTests, setEditingTest }) => {
    const batches = useSelector(state => state.batches);
    const [results, setResults] = useState([]);
    const [saving, setSaving] = useState(false);
    const [nameSearch, setNameSearch] = useState('');
    const [detailPage, setDetailPage] = useState(1);
    const resultsRef = useRef(results);
    const autoCompletedRef = useRef(false);

    useEffect(() => {
        setResults(test.studentResults || []);
        resultsRef.current = test.studentResults || [];
        autoCompletedRef.current = false;
        setNameSearch('');
        setDetailPage(1);
    }, [test._id]);

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

    const saveToBackend = async (dataToSave) => {
        setSaving(true);
        try {
            if (test._isGroup) {
                // Split results by _testId and save each group-member test separately
                const byTest = {};
                dataToSave.forEach(r => {
                    if (!byTest[r._testId]) byTest[r._testId] = [];
                    byTest[r._testId].push({
                        studentId: r.studentId._id || r.studentId,
                        appeared: r.appeared,
                        marks: r.marks,
                    });
                });
                await Promise.all(Object.entries(byTest).map(([testId, results]) =>
                    axiosInstance.put(API.UPDATE_TEST(testId), { studentResults: results })
                ));
            } else {
                const isOverdue = !autoCompletedRef.current
                    && test.status === TEST_STATUS.SCHEDULED
                    && new Date(test.testDate) < new Date();
                const formattedResults = dataToSave.map(r => ({
                    studentId: r.studentId._id ? r.studentId._id : r.studentId,
                    appeared: r.appeared,
                    marks: r.marks,
                }));
                const payload = { studentResults: formattedResults };
                if (isOverdue) payload.status = TEST_STATUS.COMPLETED;
                await axiosInstance.put(API.UPDATE_TEST(test._id), payload);
                if (isOverdue) {
                    autoCompletedRef.current = true;
                    fetchTests(test.batchId);
                }
            }
        } catch (error) {
            console.error('Failed to save test results', error);
        } finally {
            setSaving(false);
        }
    };

    const timeoutRef = useRef(null);

    const handleResultChange = (studentId, field, value) => {
        setResults(prev => {
            const updated = prev.map(r => {
                if ((r.studentId._id || r.studentId) === studentId) {
                    let finalValue = value;
                    if (field === 'marks') {
                        finalValue = Math.max(0, Math.min(Number(value) || 0, test.maxMarks));
                    }
                    return { ...r, [field]: finalValue };
                }
                return r;
            });
            resultsRef.current = updated;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => saveToBackend(resultsRef.current), 1000);
            return updated;
        });
    };

    if (!test) return null;

    return (
        <div className="p-6 border border-[#e6c8a8] rounded-3xl bg-[#f8ede3] shadow-[0_8px_24px_rgba(0,0,0,0.15)] mt-4">
            <div className="mb-5 border-b border-[#e6c8a8] pb-4">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#5a4a3c] min-w-0">
                        {test.testName}
                    </h2>
                    <div className="flex items-start gap-2 shrink-0">
                        <div className="bg-[#f0d9c0] px-3 py-1.5 rounded-xl border border-[#e6c8a8] text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#7b5c4b]">Max</div>
                            <div className="text-2xl font-black text-[#5a4a3c] leading-tight">{test.maxMarks}</div>
                            <div className="text-[10px] font-medium text-[#7b5c4b] capitalize">{test.status}</div>
                        </div>
                        {setEditingTest && (
                            <button
                                onClick={() => setEditingTest(test)}
                                title="Edit test details"
                                className="p-2 rounded-lg text-[#7b5c4b] hover:text-[#5a4a3c] hover:bg-[#f0d9c0] transition-colors border border-[#e6c8a8]"
                            >
                                <FiSettings className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                {/* Tags — full width so they never wrap inside the pill */}
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm font-medium">
                    <span className="bg-[#f0d9c0] text-[#5a4a3c] px-3 py-1 rounded-full whitespace-nowrap">{getBatchName(test.batchId)}</span>
                    <span className="bg-[#f0d9c0] text-[#5a4a3c] px-3 py-1 rounded-full whitespace-nowrap">{getSubjectName(test.batchId, test.subjectId)}</span>
                    <span className="bg-[#f0d9c0] text-[#5a4a3c] px-3 py-1 rounded-full whitespace-nowrap">{formatDateTime(test.testDate)}</span>
                </div>
            </div>

            {test.cancellationReason && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center">
                    <span className="font-bold mr-2">Canceled Because:</span> {test.cancellationReason}
                </div>
            )}

            <div className="relative">
                {test.status === TEST_STATUS.CANCELLED && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm bg-white/40 gap-2">
                        <Ban className="w-8 h-8 text-[#8b5e3c]" />
                        <p className="text-[#5a4a3c] font-semibold text-sm text-center px-4">
                            This test was cancelled — results cannot be entered.
                        </p>
                    </div>
                )}
                {results.length > 0 && test.passMarks > 0 && (() => {
                    const appeared = results.filter(r => r.appeared);
                    const passed = appeared.filter(r => r.marks >= test.passMarks).length;
                    const avg = appeared.length
                        ? (appeared.reduce((s, r) => s + r.marks, 0) / appeared.length).toFixed(1)
                        : 0;
                    return (
                        <div className="flex flex-wrap gap-3 mb-4 p-3 bg-[#f0d9c0] rounded-xl border border-[#e6c8a8] text-sm">
                            <span className="text-[#5a4a3c]">Appeared: <strong>{appeared.length}</strong></span>
                            <span className="text-[#34C759] font-semibold">Passed: <strong>{passed}</strong></span>
                            <span className="text-[#FF3B30] font-semibold">Failed: <strong>{appeared.length - passed}</strong></span>
                            <span className="text-[#5a4a3c]">Class Avg: <strong>{avg} / {test.maxMarks}</strong></span>
                            <span className="text-[#7b5c4b]">Pass Mark: <strong>{test.passMarks}</strong></span>
                        </div>
                    );
                })()}

                <div className="mb-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold text-lg text-[#5a4a3c]">Student Results</h4>
                        <span className="text-xs font-medium shrink-0">
                            {saving ? (
                                <span className="text-[#8b5e3c] animate-pulse flex items-center gap-1">
                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                <span className="text-[#34C759] flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Synced
                                </span>
                            )}
                        </span>
                    </div>
                    {results.length > 0 && (
                        <input
                            type="text"
                            value={nameSearch}
                            onChange={e => { setNameSearch(e.target.value); setDetailPage(1); }}
                            placeholder="Search by name…"
                            className="w-full px-3 py-1.5 text-sm rounded-full border border-[#e6c8a8] bg-white text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8]"
                        />
                    )}
                </div>

                {results.length > 0 ? (() => {
                    const filtered = nameSearch
                        ? results.filter(r => (r.studentId?.name || '').toLowerCase().includes(nameSearch.toLowerCase()))
                        : results;
                    const totalDetailPages = Math.max(1, Math.ceil(filtered.length / DETAIL_PAGE_SIZE));
                    const safeDetailPage = Math.min(detailPage, totalDetailPages);
                    const pagedResults = filtered.slice((safeDetailPage - 1) * DETAIL_PAGE_SIZE, safeDetailPage * DETAIL_PAGE_SIZE);
                    return (
                    <>
                    {/* Mobile list layout — one row per student */}
                    <div className="md:hidden rounded-xl border border-[#e6c8a8] overflow-hidden bg-[#f8ede3] divide-y divide-[#e6c8a8]">
                        {pagedResults.map(r => {
                            const stId = r.studentId._id || r.studentId;
                            const stName = r.studentId.name || 'Unknown Student';
                            const percent = r.appeared ? ((r.marks / test.maxMarks) * 100).toFixed(1) : 0;
                            return (
                                <div key={stId} className="px-3 py-2.5 flex flex-col gap-1.5">
                                    <span className="text-sm font-semibold text-[#5a4a3c]">{stName}</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={r.appeared}
                                            onChange={e => handleResultChange(stId, 'appeared', e.target.checked)}
                                            className="w-4 h-4 rounded accent-[#8b5e3c] cursor-pointer shrink-0"
                                        />
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={r.marks}
                                            onChange={e => handleResultChange(stId, 'marks', e.target.value)}
                                            disabled={!r.appeared}
                                            className={`w-16 text-sm text-center font-medium border-[#e6c8a8] ${!r.appeared ? 'bg-[#f0d9c0] text-[#7b5c4b] opacity-50' : 'bg-white'}`}
                                        />
                                        <span className="text-xs text-[#7b5c4b]">/{test.maxMarks}</span>
                                        {!r.appeared ? (
                                            <span className="text-xs px-2 py-0.5 bg-[#f0d9c0] text-[#7b5c4b] rounded-full font-medium">Absent</span>
                                        ) : test.passMarks > 0 ? (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${r.marks >= test.passMarks ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {r.marks >= test.passMarks ? 'PASS' : 'FAIL'}
                                            </span>
                                        ) : (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${Number(percent) >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {percent}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop table layout */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-[#e6c8a8]">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="uppercase tracking-wider border-b border-[#e6c8a8] bg-[#f0d9c0] text-[#7b5c4b] font-semibold">
                                <tr>
                                    <th className="px-6 py-4 border-r border-[#e6c8a8]">Student</th>
                                    <th className="px-6 py-4 text-center border-r border-[#e6c8a8]">Appeared</th>
                                    <th className="px-6 py-4 border-r border-[#e6c8a8]">Marks Obtained</th>
                                    <th className="px-6 py-4 border-r border-[#e6c8a8]">Percentage</th>
                                    {test.passMarks > 0 && <th className="px-6 py-4">Result</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e6c8a8] bg-[#f8ede3]">
                                {pagedResults.map(r => {
                                    const stId = r.studentId._id || r.studentId;
                                    const stName = r.studentId.name || 'Unknown Student';
                                    const percent = r.appeared ? ((r.marks / test.maxMarks) * 100).toFixed(1) : 0;
                                    return (
                                        <tr key={stId} className="hover:bg-[#f0d9c0] transition-colors">
                                            <td className="px-6 py-4 font-medium text-[#5a4a3c] border-r border-[#e6c8a8]">{stName}</td>
                                            <td className="px-6 py-4 text-center border-r border-[#e6c8a8]">
                                                <input
                                                    type="checkbox"
                                                    checked={r.appeared}
                                                    onChange={(e) => handleResultChange(stId, 'appeared', e.target.checked)}
                                                    className="w-5 h-5 rounded accent-[#8b5e3c] cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4 border-r border-[#e6c8a8]">
                                                <div className="relative flex items-center">
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={r.marks}
                                                        onChange={(e) => handleResultChange(stId, 'marks', e.target.value)}
                                                        disabled={!r.appeared}
                                                        className={`w-28 font-medium border-[#e6c8a8] ${!r.appeared ? 'bg-[#f0d9c0] text-[#7b5c4b] opacity-60' : 'bg-white focus:ring-[#e0c4a8]'}`}
                                                    />
                                                    {r.appeared && <span className="ml-2 text-[#7b5c4b] text-sm">/ {test.maxMarks}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-r border-[#e6c8a8]">
                                                {!r.appeared ? (
                                                    <span className="text-[#7b5c4b] font-medium px-2 py-1 bg-[#f0d9c0] rounded-md text-xs">Absent</span>
                                                ) : (
                                                    <span className={`font-bold px-2 py-1 rounded-md text-xs ${percent >= 80 ? 'bg-green-100 text-green-700' : percent >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                        {percent}%
                                                    </span>
                                                )}
                                            </td>
                                            {test.passMarks > 0 && (
                                                <td className="px-6 py-4">
                                                    {!r.appeared ? (
                                                        <span className="text-[#7b5c4b] text-xs">—</span>
                                                    ) : r.marks >= test.passMarks ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">PASS</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">FAIL</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {totalDetailPages > 1 && (
                        <div className="flex items-center justify-between mt-3 px-1">
                            <span className="text-xs text-[#7b5c4b]">{filtered.length} students · page {safeDetailPage} of {totalDetailPages}</span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setDetailPage(p => Math.max(1, p - 1))} disabled={safeDetailPage === 1}
                                    className="px-2 py-1 text-xs rounded-lg border border-[#e6c8a8] bg-[#f8ede3] text-[#5a4a3c] hover:bg-[#e0c4a8] disabled:opacity-40 disabled:cursor-not-allowed transition">Prev</button>
                                <button onClick={() => setDetailPage(p => Math.min(totalDetailPages, p + 1))} disabled={safeDetailPage === totalDetailPages}
                                    className="px-2 py-1 text-xs rounded-lg border border-[#e6c8a8] bg-[#f8ede3] text-[#5a4a3c] hover:bg-[#e0c4a8] disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
                            </div>
                        </div>
                    )}
                    </>
                    );
                })() : (
                    <div className="bg-[#f0d9c0] p-8 rounded-xl text-center text-[#7b5c4b] border border-[#e6c8a8] border-dashed">
                        <p className="font-medium">No students are currently allocated to this test.</p>
                        <p className="text-xs text-[#7b5c4b] mt-1">Tests created moving forward will automatically sync with batch enrollments.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestDetail;
