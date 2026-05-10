import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Camera } from "lucide-react";
import useAttendanceConstraints from "../hooks/useAttendanceConstraints.js";
import { getLocalTimeHHMM } from "@/lib/utils.js";
import { useAttendanceState } from "@/pages/Attendence/hooks/useAttendanceState.js";
import { useStudentFetcher } from "@/pages/Attendence/hooks/useStudentFetcher.js";
import { useStudentActions } from "@/pages/Attendence/hooks/useStudentActions.js";
import AttendancePercentages from "@/pages/Attendence/components/AttendancePercentages.jsx";
import { StudentList } from "@/pages/Attendence/components/StudentList.jsx";
import FaceScanPanel from "@/pages/Attendence/components/FaceScanPanel.jsx";
import { useAttendanceSubmission } from "@/pages/Attendence/hooks/useAttendanceSubmission.js";
import WrapperCard from "@/components/ui/WrapperCard.jsx";
import useFetchStudents from "@/hooks/useFetchStudents.js";
import useFetchClassLogs from "@/hooks/useFetchClassLogs.js";
import Dropdown from "@/components/ui/Dropdown";

const selectClass = "w-40";

export const AttendancePage = () => {
    const state = useAttendanceState();
    const {
        batchName, setBatchName,
        subjectName, setSubjectName,
        date, setDate,
        students,
        presentIds,
        loading,
        markedPresentStudents,
        clearForm,
        resetStudentData,
    } = state;

    const batches = useSelector((s) => s.batches);
    const groupedStudents = useSelector((s) => s.students.groupedStudents);
    const fetchGroupedStudents = useFetchStudents();
    const fetchClassLogs = useFetchClassLogs();
    const location = useLocation();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [saving, setSaving] = useState(false);
    const [dirtyCount, setDirtyCount] = useState(0);
    const [faceScanMode, setFaceScanMode] = useState(false);
    const saveTimeoutRef = useRef(null);

    const { canMark, constraintError, isValidDateTime } = useAttendanceConstraints(batchName, subjectName, date, batches);

    useEffect(() => {
        if (!groupedStudents.length) fetchGroupedStudents();
    }, []);

    // Pre-populate from navigation state (e.g. redirect from ClassesTable attendance alert)
    useEffect(() => {
        const { batchName: nb, subjectName: ns, date: nd } = location.state || {};
        if (nb) setBatchName(nb);
        if (ns) setSubjectName(ns);
        if (nd) setDate(nd);
    }, []);

    const allStudents = useMemo(() =>
        groupedStudents.flatMap(g => (g.students || []).map(s => ({ _id: s._id, name: s.name }))),
        [groupedStudents]
    );

    const isFilterActive = !!(batchName && subjectName && date);
    const displayStudents = isFilterActive ? students : allStudents;

    const { fetchStudents } = useStudentFetcher(
        batches,
        state.setStudents,
        state.setMarkedPresentStudents,
        state.setPresentIds,
        state.setLoading
    );

    const { submit } = useAttendanceSubmission(batches);

    // Reset face scan mode when the selected class changes
    useEffect(() => {
        setFaceScanMode(false);
    }, [batchName, subjectName, date]);

    const markDirty = useCallback(() => setDirtyCount((c) => c + 1), []);

    const actions = useStudentActions(
        presentIds,
        state.setPresentIds,
        students,
        markedPresentStudents,
        markDirty
    );

    useEffect(() => {
        if (!batchName || !subjectName || !date) return;
        const timer = setTimeout(() => {
            fetchStudents(batchName, subjectName, date);
        }, 300);
        return () => clearTimeout(timer);
    }, [batchName, subjectName, date]);

    useEffect(() => {
        if (!dirtyCount || !students.length) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setSaving(true);
        saveTimeoutRef.current = setTimeout(async () => {
            const ok = await submit(batchName, subjectName, date, presentIds, isValidDateTime);
            setSaving(false);
            if (ok) {
                const now = getLocalTimeHHMM();
                const newMarked = students
                    .filter(s => presentIds.has(s._id.toString()))
                    .map(s => ({ _id: s._id, name: s.name, time: now }));
                state.setMarkedPresentStudents(newMarked);
                setRefreshTrigger((t) => t + 1);
                fetchClassLogs().catch(console.error);
            }
        }, 800);
        return () => clearTimeout(saveTimeoutRef.current);
    }, [dirtyCount]);

    const handleFaceRecognized = useCallback((studentId) => {
        if (!presentIds.has(studentId)) {
            actions.togglePresent(studentId);
        }
    }, [presentIds, actions]);

    const selectedBatch = batches.find((b) => b.name === batchName);

    return (
        <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
            {/* Controls header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <WrapperCard>
                    <div className="bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] px-5 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-lg font-bold text-[#5a4a3c] shrink-0 mr-1">Attendance</h1>

                            <div className={selectClass}>
                                <Dropdown
                                    value={batchName}
                                    onChange={(e) => { setBatchName(e.target.value); setSubjectName(""); setDate(""); resetStudentData(); }}
                                    options={[
                                        { label: "Select Batch", value: "" },
                                        ...batches.map((b) => ({ label: b.name, value: b.name }))
                                    ]}
                                />
                            </div>

                            <div className={selectClass}>
                                <Dropdown
                                    value={subjectName}
                                    onChange={(e) => { setSubjectName(e.target.value); setDate(""); resetStudentData(); }}
                                    disabled={!batchName}
                                    options={[
                                        { label: "Select Subject", value: "" },
                                        ...(selectedBatch?.subject || []).map((s) => ({ label: s.name, value: s.name }))
                                    ]}
                                />
                            </div>

                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                disabled={!batchName || !subjectName}
                                max={new Date().toISOString().split("T")[0]}
                                className="border border-[#e6c8a8] px-4 py-2.5 rounded-full text-sm text-[#5a4a3c] bg-white shadow-sm focus:ring-2 focus:ring-[#e0c4a8] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />

                            <button
                                onClick={clearForm}
                                className="px-5 py-2.5 bg-[#e0c4a8] text-[#5a4a3c] text-sm font-medium rounded-full shadow-sm hover:bg-[#d8bca0] transition-colors"
                            >
                                Clear
                            </button>

                            {isFilterActive && canMark && (
                                <button
                                    onClick={() => setFaceScanMode(prev => !prev)}
                                    className={`px-4 py-2.5 text-sm font-medium rounded-full shadow-sm transition-colors flex items-center gap-1.5 ${
                                        faceScanMode
                                            ? 'bg-[#8b5e3c] text-white'
                                            : 'bg-[#e0c4a8] text-[#5a4a3c] hover:bg-[#d8bca0]'
                                    }`}
                                >
                                    <Camera className="w-4 h-4" />
                                    {faceScanMode ? 'Manual Mode' : 'Face Scan'}
                                </button>
                            )}

                            <div className="ml-auto text-sm">
                                {loading ? (
                                    <span className="text-[#7b5c4b] flex items-center gap-1.5">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading
                                    </span>
                                ) : saving ? (
                                    <span className="text-[#8b5e3c] flex items-center gap-1.5 animate-pulse">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving
                                    </span>
                                ) : students.length > 0 ? (
                                    <span className="text-[#34C759] flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Saved
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </WrapperCard>
            </motion.div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0"
            >
                {/* Left: Mark Attendance */}
                <div className="lg:w-[380px] shrink-0 min-h-[24rem] lg:min-h-0">
                    <WrapperCard>
                        {faceScanMode ? (
                            <FaceScanPanel
                                students={displayStudents}
                                batchId={selectedBatch?._id}
                                presentIds={presentIds}
                                onStudentRecognized={handleFaceRecognized}
                                onClose={() => setFaceScanMode(false)}
                                canMark={canMark}
                            />
                        ) : (
                            <StudentList
                                students={displayStudents}
                                presentIds={presentIds}
                                loading={loading}
                                markedPresentStudents={markedPresentStudents}
                                togglePresent={actions.togglePresent}
                                selectAll={actions.selectAll}
                                clearAll={actions.clearAll}
                                markAllPreviouslyPresent={actions.markAllPreviouslyPresent}
                                saving={saving}
                                readOnly={!isFilterActive || !canMark}
                                constraintError={isFilterActive ? constraintError : ""}
                                batchName={batchName}
                                subjectName={subjectName}
                                date={date}
                            />
                        )}
                    </WrapperCard>
                </div>

                {/* Right: Summary — full height */}
                <div className="flex-1 min-w-0 min-h-[24rem] lg:min-h-0">
                    <WrapperCard>
                        <AttendancePercentages
                            batchName={batchName}
                            subjectName={subjectName}
                            refreshTrigger={refreshTrigger}
                            presentIds={presentIds}
                            savedPresentStudents={markedPresentStudents}
                            isFilterActive={isFilterActive}
                        />
                    </WrapperCard>
                </div>
            </motion.div>
        </div>
    );
};

export default AttendancePage;
