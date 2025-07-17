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
import Card from "@/pages/Dashboard/comps/uii/Card.jsx";
import { useSelector } from "react-redux";
import { useState, useMemo } from 'react';
import WrapperCard from "@/utilities/WrapperCard.jsx";


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

    const classlogs = useSelector((state) => state.classlogs) || [];
    const batches = useSelector((state) => state.batches) || [];

    const studentSubjects = useMemo(() => {
        const batch = batches.find((b) => b._id === student.batchId);
        if (!batch || !student.subjectId) return [];

        return student.subjectId
            .map((sid) => batch.subject?.find((s) => s._id === sid)?.name)
            .filter(Boolean)
            .sort();
    }, [student.subjectId, student.batchId, batches]);

    const attendanceData = useMemo(() => {
        if (!classlogs || !student.subjectId) return [];

        const admissionDate = new Date(student.admission_date);
        if (isNaN(admissionDate.getTime())) return [];

        const data = classlogs
            .filter((classlog) => {
                if (!classlog.subject_id || !classlog.classes) return false;
                return student.subjectId.includes(classlog.subject_id);
            })
            .flatMap((classlog) => {
                const batch = batches.find((b) => {
                    const batchId = classlog.batch_id?._id || classlog.batch_id;
                    return b._id.toString() === batchId?.toString();
                });

                const subject = batch?.subject?.find((s) => s._id.toString() === classlog.subject_id.toString());

                return classlog.classes
                    .filter((cls) => {
                        const classDate = new Date(cls.date);
                        return classDate >= admissionDate; // Filter classes on or after admission date
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
                            status: status,
                            hasHeld: cls.hasHeld,
                            updated: cls.updated
                        };
                    });
            })
            .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

        return data;
    }, [classlogs, student.subjectId, student.studentId, batches, student.admission_date]);

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

        return {
            present: presentCount,
            total: totalCount,
            percentage: percentage
        };
    }, [attendanceData]);

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
                <div className="flex gap-6 h-64 mb-4">
                    <WrapperCard className="flex-1">
                        <div className="w-full h-full p-6 flex flex-col justify-between bg-[#f4e3d0] border-[#ddb892] rounded-2xl shadow-md">
                            <div>
                                <h2 className="text-xl font-semibold text-[#4a3a2c] mb-4 flex items-center">
                                    <FaUser className="w-5 h-5 mr-2 text-[#6b4c3b]"/>
                                    General Information
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="font-medium text-[#6b4c3b] w-20">Name:</span>
                                        <span className="text-[#4a3a2c]">{student.studentName || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-[#6b4c3b] w-20">Grade:</span>
                                        <span className="text-[#4a3a2c]">{student.grade || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-[#6b4c3b] w-20">Batch:</span>
                                        <span className="text-[#4a3a2c]">{student.batchName || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="font-medium text-[#6b4c3b] w-20">Subjects:</span>
                                        <span className="text-[#4a3a2c]">{student.subjects || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </WrapperCard>

                    <WrapperCard className="flex-1">
                        <div className="w-full h-full p-6 bg-[#f4e3d0] border-[#ddb892] rounded-2xl shadow-md">
                            <h2 className="text-xl font-semibold text-[#4a3a2c] mb-4 flex items-center">
                                <FaSchool className="w-5 h-5 mr-2 text-[#6b4c3b]"/>
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-medium text-[#6b4c3b] block">School:</span>
                                        <span className="text-[#4a3a2c] text-sm">{student.school_name || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#6b4c3b] block">Admission Date:</span>
                                        <span className="text-[#4a3a2c] text-sm">{formatDate(student.admission_date)}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#6b4c3b] block">Student Phone:</span>
                                        <span className="text-[#4a3a2c] text-sm">{student.contact_info?.phoneNumbers?.student || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="font-medium text-[#6b4c3b] block">Mom Phone:</span>
                                        <span className="text-[#4a3a2c] text-sm">{student.contact_info?.phoneNumbers?.mom || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#6b4c3b] block">Dad Phone:</span>
                                        <span className="text-[#4a3a2c] text-sm">{student.contact_info?.phoneNumbers?.dad || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#6b4c3b] block">Student Email:</span>
                                        <span className="text-[#4a3a2c] text-sm">{student.contact_info?.emailIds?.student || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </WrapperCard>

                    <WrapperCard className="flex-1">
                        <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-[#f4e3d0] border-[#ddb892] rounded-2xl shadow-md">
                            <h2 className="text-xl font-semibold text-[#4a3a2c] mb-4">Attendance Summary</h2>
                            <AttendanceChart percentage={attendanceStats.percentage}/>
                            <div className="mt-4 text-center">
                                <div className="text-sm text-[#6b4c3b]">
                                    Present: {attendanceStats.present} / Total: {attendanceStats.total}
                                </div>
                            </div>
                        </div>
                    </WrapperCard>
                </div>

                <div className="flex-1 overflow-auto max-h-[450px]">
                    <WrapperCard>
                        <div className="w-full p-4 bg-[#f4e3d0] border-[#ddb892] rounded-2xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-[#4a3a2c] flex items-center">
                                    <FaCalendarAlt className="text-[#6b4c3b] mr-2"/>
                                    Attendance History
                                </h2>
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-2 rounded-md text-sm border border-[#ddb892] bg-[#e7c6a5] text-[#4a3a2c] focus:ring-[#d7b48f] focus:outline-none"
                                    >
                                        <option value="">All Status</option>
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="No Class">No Class</option>
                                        <option value="No Data">No Data</option>
                                    </select>
                                    <select
                                        value={subjectFilter}
                                        onChange={(e) => setSubjectFilter(e.target.value)}
                                        className="px-3 py-2 rounded-md text-sm border border-[#ddb892] bg-[#e7c6a5] text-[#4a3a2c] focus:ring-[#d7b48f] focus:outline-none"
                                    >
                                        <option value="">All Subjects</option>
                                        {studentSubjects.map(subject => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={resetFilters}
                                        className="px-3 py-2 text-sm bg-[#d7b48f] text-[#4a3a2c] hover:bg-[#d7b48f]/80 rounded-md"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-[600px] w-full text-sm text-left border-collapse">
                                    <thead className="bg-[#d7b48f]/20 text-[#4a3a2c] font-semibold">
                                    <tr>
                                        <th className="p-3 border-b border-[#ddb892]">Sr No</th>
                                        <th className="p-3 border-b border-[#ddb892]">Date</th>
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
                                                <td className="p-3 border-b border-[#ddb892]">{entry.subjectName}</td>
                                                <td className="p-3 border-b border-[#ddb892]">
                                                    <StatusBadge status={entry.status}/>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-[#6b4c3b]">
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
                    </WrapperCard>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;