import { useNavigate } from 'react-router-dom';
import {
    FaUser,
    FaCalendarAlt,
    FaSchool,
    FaChevronLeft,
    FaCheckCircle,
    FaTimesCircle,
    FaMinusCircle,
    FaQuestionCircle,
    FaChevronRight
} from 'react-icons/fa';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useState, useMemo } from 'react';
import WrapperCard from "@/components/ui/WrapperCard.jsx";
import Dropdown from "@/components/ui/Dropdown";


// StatusBadge with consistent status colors (retaining green/red/yellow for clarity)
const StatusBadge = ({ status }) => {
    const statusConfig = {
        Present: { icon: FaCheckCircle, color: "text-green-600 bg-green-100 border-green-200", label: "Present" },
        Absent: { icon: FaTimesCircle, color: "text-red-600 bg-red-100 border-red-200", label: "Absent" },
        "No Class": { icon: FaMinusCircle, color: "text-gray-600 bg-gray-100 border-gray-200", label: "No Class" },
        "No Data": { icon: FaQuestionCircle, color: "text-yellow-600 bg-yellow-100 border-yellow-200", label: "No Data" }
    };

    const config = statusConfig[status] || statusConfig["No Data"];
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
            <IconComponent className="w-4 h-4 mr-1" />
            {config.label}
        </span>
    );
};

// Format date utility
const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    } catch {
        return 'Invalid Date';
    }
};

// AttendanceChart with updated stroke colors based on palette
const AttendanceChart = ({ percentage }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
        <div className="relative w-24 h-24 mx-auto">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#e7c6a5"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={percentage >= 75 ? "#d7b48f" : percentage >= 50 ? "#6b4c3b" : "#4a3a2c"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg font-bold text-[#4a3a2c]">{percentage}%</div>
                </div>
            </div>
        </div>
    );
};

const StudentProfile = ({ student: std, setShowStudentProfile }) => {
    const navigate = useNavigate();
    const student = std.student;

    const [statusFilter, setStatusFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [testSubjectFilter, setTestSubjectFilter] = useState('');
    const [testResultFilter, setTestResultFilter] = useState('');

    // All hooks must be called unconditionally — before any early return
    const classlogs = useSelector((state) => state.classlogs) || [];
    const batches = useSelector((state) => state.batches) || [];
    const allTests = useSelector((state) => state.tests.tests) || [];

    const studentSubjects = useMemo(() => {
        if (!student) return [];
        // Include subjects from all batches (current + historical)
        const names = new Set();
        const currentBatch = batches.find((b) => b._id === student.batchId);
        (student.subjectId || []).forEach(sid => {
            const name = currentBatch?.subject?.find(s => s._id === sid)?.name;
            if (name) names.add(name);
        });
        (student.enrollmentHistory || []).forEach(enrollment => {
            const batch = batches.find(b => b._id?.toString() === enrollment.batchId?.toString());
            (enrollment.subjectIds || []).forEach(sid => {
                const name = batch?.subject?.find(s => s._id?.toString() === sid?.toString())?.name;
                if (name) names.add(name);
            });
        });
        return [...names].sort();
    }, [student, batches]);

    const attendanceData = useMemo(() => {
        if (!student || !classlogs) return [];

        const admissionDate = new Date(student.admission_date);
        if (isNaN(admissionDate.getTime())) return [];

        // Collect all subject IDs across current + historical enrollments
        const allSubjectIds = new Set([
            ...(student.subjectId || []).map(s => s?.toString()),
            ...(student.enrollmentHistory || []).flatMap(e => (e.subjectIds || []).map(s => s?.toString())),
        ]);

        // Build enrollment windows for date-range checking
        const enrollmentWindows = [
            ...(student.enrollmentHistory || []).map(e => ({
                batchId: e.batchId?.toString(),
                from: new Date(e.joinedAt),
                to: new Date(e.leftAt),
            })),
            // Current enrollment: from last history entry's leftAt (or admission_date) to now
            {
                batchId: student.batchId?.toString(),
                from: student.enrollmentHistory?.length
                    ? new Date(student.enrollmentHistory[student.enrollmentHistory.length - 1].leftAt)
                    : admissionDate,
                to: new Date(8640000000000000), // far future
            },
        ].filter(w => w.batchId);

        const data = classlogs
            .filter((classlog) => {
                if (!classlog.subject_id || !classlog.classes) return false;
                return allSubjectIds.has(classlog.subject_id?.toString());
            })
            .flatMap((classlog) => {
                const batch = batches.find((b) => {
                    const batchId = classlog.batch_id?._id || classlog.batch_id;
                    return b._id.toString() === batchId?.toString();
                });

                const subject = batch?.subject?.find((s) => s._id.toString() === classlog.subject_id.toString());

                const logBatchId = (classlog.batch_id?._id || classlog.batch_id)?.toString();
                const window = enrollmentWindows.find(w => w.batchId === logBatchId);
                if (!window) return [];

                return classlog.classes
                    .filter((cls) => {
                        const classDate = new Date(cls.date);
                        return classDate >= window.from && classDate <= window.to;
                    })
                    .map((cls) => {
                        let status = 'No Data';

                        if (cls.updated) {
                            if (!cls.hasHeld) {
                                status = 'No Class';
                            } else {
                                const isPresent = cls.attendance?.some((att) => {
                                    const studentId = att.studentIds?._id || att.studentIds;
                                    return studentId?.toString() === student.studentId?.toString();
                                });
                                status = isPresent ? 'Present' : 'Absent';
                            }
                        }

                        return {
                            batchName: batch?.name || classlog.batch_id?.name || 'Unknown',
                            subjectName: subject?.name || 'Unknown',
                            date: formatDate(cls.date),
                            rawDate: cls.date,
                            status,
                            hasHeld: cls.hasHeld,
                            updated: cls.updated,
                        };
                    });
            })
            .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

        return data;
    }, [classlogs, student, batches]);

    const filteredAttendanceData = useMemo(() => {
        return attendanceData.filter((entry) => {
            const matchesSubject = subjectFilter ? entry.subjectName === subjectFilter : true;
            const matchesStatus = statusFilter ? entry.status === statusFilter : true;
            return matchesSubject && matchesStatus;
        });
    }, [attendanceData, subjectFilter, statusFilter]);

    const attendanceStats = useMemo(() => {
        const validClasses = attendanceData.filter(entry => entry.status === 'Present' || entry.status === 'Absent');
        const presentCount = attendanceData.filter(entry => entry.status === 'Present').length;
        const totalCount = validClasses.length;
        const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        return { present: presentCount, total: totalCount, percentage };
    }, [attendanceData]);

    const testResults = useMemo(() => {
        if (!student) return [];
        return allTests
            .flatMap(test => {
                const result = test.studentResults?.find(r => {
                    const rid = r.studentId?._id || r.studentId;
                    return rid?.toString() === student.studentId?.toString();
                });
                if (!result) return [];
                const batch = batches.find(b => b._id?.toString() === test.batchId?.toString());
                const subject = batch?.subject?.find(s => s._id?.toString() === test.subjectId?.toString());
                const passed = test.passMarks > 0 && result.appeared
                    ? result.marks >= test.passMarks ? 'Pass' : 'Fail'
                    : null;
                return [{
                    testName: test.testName,
                    date: test.testDate,
                    batchName: batch?.name || '—',
                    subjectName: subject?.name || '—',
                    maxMarks: test.maxMarks,
                    passMarks: test.passMarks,
                    marks: result.marks,
                    appeared: result.appeared,
                    passed,
                    testStatus: test.status,
                }];
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allTests, student, batches]);

    const testStats = useMemo(() => {
        const appeared = testResults.filter(t => t.appeared);
        const totalMarks = appeared.reduce((s, t) => s + t.marks, 0);
        const totalMax = appeared.reduce((s, t) => s + t.maxMarks, 0);
        const passed = appeared.filter(t => t.passed === 'Pass').length;
        const avgPct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
        return { appeared: appeared.length, total: testResults.length, passed, avgPct };
    }, [testResults]);

    const testSubjects = useMemo(() => [...new Set(testResults.map(t => t.subjectName).filter(s => s !== '—'))], [testResults]);

    const filteredTestResults = useMemo(() => {
        return testResults.filter(t => {
            if (testSubjectFilter && t.subjectName !== testSubjectFilter) return false;
            if (testResultFilter === 'Pass' && t.passed !== 'Pass') return false;
            if (testResultFilter === 'Fail' && t.passed !== 'Fail') return false;
            if (testResultFilter === 'Absent' && t.appeared !== false) return false;
            return true;
        });
    }, [testResults, testSubjectFilter, testResultFilter]);

    const handleGoBack = () => {
        setShowStudentProfile({
            show: false,
            student: null,
        });
    };

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 bg-[#e7c6a5]">
                <div className="text-center">
                    <FaUser className="w-16 h-16 text-[#6b4c3b] mx-auto mb-4" />
                    <p className="text-lg text-[#4a3a2c] mb-4">No student data provided.</p>
                    <button
                        className="inline-flex items-center px-6 py-3 bg-[#d7b48f] text-[#4a3a2c] rounded-lg hover:bg-[#d7b48f]/80 transition-colors"
                        onClick={handleGoBack}
                    >
                        <FaChevronLeft className="w-4 h-4 mr-2" />
                        Back to Info Page
                    </button>
                </div>
            </div>
        );
    }

    const resetFilters = () => {
        setStatusFilter('');
        setSubjectFilter('');
    };

    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGoBack}
                        className="p-2 bg-[#f4e3d0] rounded-lg shadow-md border border-[#ddb892] hover:bg-[#d7b48f] transition-colors"
                    >
                        <FaChevronLeft className="w-5 h-5 text-[#4a3a2c]"/>
                    </button>
                    <h1 className="text-2xl font-bold text-[#4a3a2c]">Student Profile</h1>
                </div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#4a3a2c]">Edit Info</h1>
                    <button
                        onClick={() => navigate('/main/student-data')}
                        className="p-2 bg-[#f4e3d0] rounded-lg shadow-md border border-[#ddb892] hover:bg-[#d7b48f] transition-colors"
                    >
                        <FaChevronRight className="w-5 h-5 text-[#4a3a2c]"/>
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mb-4">
                    <WrapperCard className="flex-1 ">
                        <div
                            className="w-full p-6 flex flex-col bg-[#f8ede3] border-[#ddb892] rounded-2xl shadow-md">
                            <h2 className="text-xl font-semibold text-[#4a3a2c] mb-4 flex items-center">
                                <FaUser className="w-5 h-5 mr-2 text-[#6b4c3b]"/>
                                General Information
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <span className="font-medium text-[#6b4c3b] w-20 shrink-0">Name:</span>
                                    <span className="text-[#4a3a2c] break-words min-w-0">{student.studentName || 'N/A'}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-medium text-[#6b4c3b] w-20 shrink-0">Grade:</span>
                                    <span className="text-[#4a3a2c]">{student.grade || 'N/A'}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-medium text-[#6b4c3b] w-20 shrink-0">Batch:</span>
                                    <span className="text-[#4a3a2c] break-words min-w-0">{student.batchName || 'N/A'}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-medium text-[#6b4c3b] w-20 shrink-0">Subjects:</span>
                                    <span className="text-[#4a3a2c] break-words min-w-0">{student.subjects || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </WrapperCard>

                    <WrapperCard className="flex-1">
                        <div className="w-full p-6 bg-[#f8ede3] border-[#ddb892] rounded-2xl shadow-md">
                            <h2 className="text-xl font-semibold text-[#4a3a2c] mb-4 flex items-center">
                                <FaSchool className="w-5 h-5 mr-2 text-[#6b4c3b]"/>
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <div>
                                    <span className="font-medium text-[#6b4c3b] block">School:</span>
                                    <span className="text-[#4a3a2c] text-sm break-words">{student.school_name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-[#6b4c3b] block">Mom Phone:</span>
                                    <span className="text-[#4a3a2c] text-sm">{student.contact_info?.phoneNumbers?.mom || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-[#6b4c3b] block">Admission Date:</span>
                                    <span className="text-[#4a3a2c] text-sm">{formatDate(student.admission_date)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-[#6b4c3b] block">Dad Phone:</span>
                                    <span className="text-[#4a3a2c] text-sm">{student.contact_info?.phoneNumbers?.dad || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-[#6b4c3b] block">Student Phone:</span>
                                    <span className="text-[#4a3a2c] text-sm">{student.contact_info?.phoneNumbers?.student || 'N/A'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium text-[#6b4c3b] block">Student Email:</span>
                                    <span className="text-[#4a3a2c] text-sm break-all">{student.contact_info?.emailIds?.student || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </WrapperCard>

                    <WrapperCard className="flex-1">
                        <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-[#f8ede3] border-[#ddb892] rounded-2xl shadow-md">
                            <h2 className="text-xl font-semibold text-[#4a3a2c] mb-4">Attendance Summary</h2>
                            <AttendanceChart percentage={attendanceStats.percentage}/>
                            <div className="mt-4 text-center">
                                <div className="text-sm text-[#6b4c3b]">
                                    Present: {attendanceStats.present} / Total: {attendanceStats.total}
                                </div>
                            </div>
                        </div>
                    </WrapperCard>

                    <WrapperCard className="flex-1">
                        <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-[#f8ede3] border-[#ddb892] rounded-2xl shadow-md">
                            <h2 className="text-xl font-semibold text-[#4a3a2c] mb-4">Test Summary</h2>
                            <AttendanceChart percentage={testStats.avgPct}/>
                            <div className="mt-4 text-center space-y-1">
                                <div className="text-sm text-[#6b4c3b]">
                                    Appeared: {testStats.appeared} / Total: {testStats.total}
                                </div>
                                {testStats.appeared > 0 && testResults.some(t => t.passed !== null) && (
                                    <div className="text-sm text-[#6b4c3b]">
                                        Passed: {testStats.passed} / {testStats.appeared}
                                    </div>
                                )}
                            </div>
                        </div>
                    </WrapperCard>
                </div>

                {/* Enrollment history timeline */}
                {student.enrollmentHistory?.length > 0 && (
                    <div className="mb-4">
                        <WrapperCard>
                            <div className="w-full p-4 bg-[#f8ede3] border-[#ddb892] rounded-2xl shadow-md">
                                <h2 className="text-lg font-semibold text-[#4a3a2c] mb-3 flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-[#c47d3e]" />
                                    Batch Transfer History
                                </h2>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {student.enrollmentHistory.map((e, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="flex flex-col bg-[#f0d9c0] border border-[#e6c8a8] rounded-xl px-3 py-1.5 text-xs">
                                                <span className="font-semibold text-[#5a4a3c]">{e.batchName}</span>
                                                <span className="text-[#7b5c4b]">
                                                    {formatDate(e.joinedAt)} → {formatDate(e.leftAt)}
                                                </span>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-[#c47d3e] shrink-0" />
                                        </div>
                                    ))}
                                    <div className="flex flex-col bg-[#e0c4a8] border border-[#d0b498] rounded-xl px-3 py-1.5 text-xs">
                                        <span className="font-semibold text-[#5a4a3c]">{student.batchName} (Current)</span>
                                        <span className="text-[#7b5c4b]">
                                            {formatDate(student.enrollmentHistory[student.enrollmentHistory.length - 1].leftAt)} → Now
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </WrapperCard>
                    </div>
                )}

                <div className="flex-1 h-full">
                    <WrapperCard>
                        <div
                            className="w-full h-full p-4 bg-[#f8ede3] border-[#ddb892] rounded-2xl shadow-md flex flex-col">
                            <div
                                className="sm:flex sm:flex-row flex flex-col justify-between items-center mb-4 flex-shrink-0">
                                <h2 className="text-xl font-semibold text-[#4a3a2c] flex items-center">
                                    <FaCalendarAlt className="text-[#6b4c3b] mr-2"/>
                                    Attendance History
                                </h2>
                                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center mt-2 gap-2">
                                    <Dropdown
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        options={[
                                            { label: "All Status", value: "" },
                                            { label: "Present", value: "Present" },
                                            { label: "Absent", value: "Absent" },
                                            { label: "No Class", value: "No Class" },
                                            { label: "No Data", value: "No Data" }
                                        ]}
                                    />
                                    <Dropdown
                                        value={subjectFilter}
                                        onChange={(e) => setSubjectFilter(e.target.value)}
                                        options={[
                                            { label: "All Subjects", value: "" },
                                            ...studentSubjects.map(subject => ({ label: subject, value: subject }))
                                        ]}
                                    />
                                    <button
                                        onClick={resetFilters}
                                        className="px-3 py-2 text-sm bg-[#d7b48f] text-[#4a3a2c] hover:bg-[#d7b48f]/80 rounded-md"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto h-full">
                                <div className="overflow-x-auto">
                                    <table className="min-w-[600px] w-full text-sm text-left border-collapse">
                                        <thead
                                            className="bg-[#d7b48f]/20 text-[#4a3a2c] font-semibold sticky top-0 z-10">
                                        <tr>
                                            <th className="p-3 border-b border-[#ddb892]">Sr No</th>
                                            <th className="p-3 border-b border-[#ddb892]">Date</th>
                                            <th className="p-3 border-b border-[#ddb892]">Batch</th>
                                            <th className="p-3 border-b border-[#ddb892]">Subject</th>
                                            <th className="p-3 border-b border-[#ddb892]">Status</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredAttendanceData.length > 0 ? (
                                            filteredAttendanceData.map((entry, index) => (
                                                <tr key={`${entry.date}-${entry.subjectName}-${index}`}
                                                    className="hover:bg-[#e7c6a5]/50">
                                                    <td className="p-3 border-b border-[#ddb892]">{index + 1}</td>
                                                    <td className="p-3 border-b border-[#ddb892]">{entry.date}</td>
                                                    <td className="p-3 border-b border-[#ddb892] text-[#7b5c4b] text-xs">{entry.batchName}</td>
                                                    <td className="p-3 border-b border-[#ddb892]">{entry.subjectName}</td>
                                                    <td className="p-3 border-b border-[#ddb892]">
                                                        <StatusBadge status={entry.status}/>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-[#6b4c3b]">
                                                    <div className="flex flex-col items-center">
                                                        <FaCalendarAlt className="text-4xl text-[#6b4c3b] mb-2"/>
                                                        <p className="text-lg">No attendance data found</p>
                                                        <p className="text-sm">Try adjusting filters</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </WrapperCard>
                </div>

                {/* Test Performance */}
                <div className="mt-4">
                    <WrapperCard>
                        <div className="w-full p-4 bg-[#f8ede3] border-[#ddb892] rounded-2xl shadow-md flex flex-col">
                            <div className="sm:flex sm:flex-row flex flex-col justify-between items-center mb-4 flex-shrink-0">
                                <h2 className="text-xl font-semibold text-[#4a3a2c] flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-[#6b4c3b]" />
                                    Test Performance
                                    <span className="text-sm font-normal text-[#6b4c3b]">({testResults.length} test{testResults.length !== 1 ? 's' : ''})</span>
                                </h2>
                                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center mt-2 gap-2">
                                    <Dropdown
                                        value={testSubjectFilter}
                                        onChange={(e) => setTestSubjectFilter(e.target.value)}
                                        options={[
                                            { label: "All Subjects", value: "" },
                                            ...testSubjects.map(s => ({ label: s, value: s }))
                                        ]}
                                    />
                                    <Dropdown
                                        value={testResultFilter}
                                        onChange={(e) => setTestResultFilter(e.target.value)}
                                        options={[
                                            { label: "All Results", value: "" },
                                            { label: "Pass", value: "Pass" },
                                            { label: "Fail", value: "Fail" },
                                            { label: "Absent", value: "Absent" },
                                        ]}
                                    />
                                    {(testSubjectFilter || testResultFilter) && (
                                        <button
                                            onClick={() => { setTestSubjectFilter(''); setTestResultFilter(''); }}
                                            className="px-3 py-2 text-sm bg-[#d7b48f] text-[#4a3a2c] hover:bg-[#d7b48f]/80 rounded-md"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-[600px] w-full text-sm text-left border-collapse">
                                    <thead className="bg-[#d7b48f]/20 text-[#4a3a2c] font-semibold">
                                        <tr>
                                            <th className="p-3 border-b border-[#ddb892]">#</th>
                                            <th className="p-3 border-b border-[#ddb892]">Test</th>
                                            <th className="p-3 border-b border-[#ddb892]">Date</th>
                                            <th className="p-3 border-b border-[#ddb892]">Batch</th>
                                            <th className="p-3 border-b border-[#ddb892]">Subject</th>
                                            <th className="p-3 border-b border-[#ddb892]">Marks</th>
                                            <th className="p-3 border-b border-[#ddb892]">Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTestResults.length > 0 ? (
                                            filteredTestResults.map((t, i) => (
                                                <tr key={i} className="hover:bg-[#e7c6a5]/50">
                                                    <td className="p-3 border-b border-[#ddb892] text-[#6b4c3b]">{i + 1}</td>
                                                    <td className="p-3 border-b border-[#ddb892] font-medium text-[#4a3a2c]">{t.testName}</td>
                                                    <td className="p-3 border-b border-[#ddb892] text-[#6b4c3b] whitespace-nowrap">{formatDate(t.date)}</td>
                                                    <td className="p-3 border-b border-[#ddb892] text-[#7b5c4b] text-xs whitespace-nowrap">{t.batchName}</td>
                                                    <td className="p-3 border-b border-[#ddb892] text-[#6b4c3b]">{t.subjectName}</td>
                                                    <td className="p-3 border-b border-[#ddb892]">
                                                        {!t.appeared ? (
                                                            <span className="text-[#6b4c3b]">—</span>
                                                        ) : (
                                                            <span className="font-semibold text-[#4a3a2c]">
                                                                {t.marks}
                                                                <span className="text-xs font-normal text-[#6b4c3b]"> / {t.maxMarks}</span>
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 border-b border-[#ddb892]">
                                                        {!t.appeared ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                <FaTimesCircle className="w-3 h-3" /> Absent
                                                            </span>
                                                        ) : t.passed === 'Pass' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                                <FaCheckCircle className="w-3 h-3" /> Pass
                                                            </span>
                                                        ) : t.passed === 'Fail' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 border border-red-200">
                                                                <FaTimesCircle className="w-3 h-3" /> Fail
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600 border border-blue-200">
                                                                <FaCheckCircle className="w-3 h-3" /> Appeared
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-[#6b4c3b]">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <ClipboardList className="w-10 h-10 text-[#ddb892]" />
                                                        <p className="font-medium">{testResults.length === 0 ? 'No test data found' : 'No tests match filters'}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </WrapperCard>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;