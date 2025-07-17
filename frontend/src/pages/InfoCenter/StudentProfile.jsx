import { useNavigate } from 'react-router-dom';
import {
    FaUser,
    FaPhone,
    FaEnvelope,
    FaCalendarAlt,
    FaSchool,
    FaChevronLeft,
    FaFilter,
    FaCheckCircle,
    FaTimesCircle,
    FaMinusCircle,
    FaQuestionCircle,
    FaChevronRight
} from 'react-icons/fa';
import { useSelector } from "react-redux";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";

const StatusBadge = ({ status }) => {
    const statusConfig = {
        Present: { icon: FaCheckCircle, color: "text-success bg-success/10", label: "Present" },
        Absent: { icon: FaTimesCircle, color: "text-error bg-error/10", label: "Absent" },
        "No Class": { icon: FaMinusCircle, color: "text-text-light bg-background", label: "No Class" },
        "No Data": { icon: FaQuestionCircle, color: "text-warning bg-warning/10", label: "No Data" }
    };

    const config = statusConfig[status] || statusConfig["No Data"];
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
            <IconComponent className="w-4 h-4 mr-1" />
            {config.label}
        </span>
    );
};

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
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={percentage >= 75 ? "#5CB85C" : percentage >= 50 ? "#F0AD4E" : "#D9534F"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - ((percentage / 100) * circumference) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg font-bold text-text">{percentage}%</div>
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
            <div className="flex flex-col items-center justify-center h-full p-6 bg-background">
                <div className="text-center">
                    <FaUser className="w-16 h-16 text-text-light mx-auto mb-4" />
                    <p className="text-lg text-text-light mb-4">No student data provided.</p>
                    <button
                        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
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

                return classlog.classes.map((cls) => {
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
    }, [classlogs, student.subjectId, student.studentId, batches]);

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
        <div className="flex flex-col gap-6 p-6 h-full overflow-hidden bg-background">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGoBack}
                        className="p-2 bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow border border-border"
                    >
                        <FaChevronLeft className="w-5 h-5 text-text-light"/>
                    </button>
                    <h1 className="text-2xl font-bold text-text">Student Profile</h1>
                </div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-text">Edit Info</h1>
                    <button
                        onClick={()=>navigate('/main/student-data')}
                        className="p-2 bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow border border-border"
                    >
                        <FaChevronRight className="w-5 h-5 text-text-light"/>
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white rounded-2xl shadow-soft p-6 flex flex-col justify-between border border-border">
                        <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
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
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white rounded-2xl shadow-soft p-6 border border-border">
                        <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
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
                                    <span className="text-text text-sm">{formatDate(student.admission_date)}</span>
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
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white rounded-2xl shadow-soft p-6 flex flex-col items-center justify-center border border-border">
                        <h2 className="text-xl font-semibold text-text mb-4">Attendance Summary</h2>
                        <AttendanceChart percentage={attendanceStats.percentage}/>
                        <div className="mt-4 text-center">
                            <div className="text-sm text-text-light">
                                Present: {attendanceStats.present} / Total: {attendanceStats.total}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex-1 overflow-auto bg-white rounded-2xl shadow-soft p-6 border border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-text flex items-center">
                            <FaCalendarAlt className="text-primary mr-2"/>
                            Attendance History
                        </h2>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 rounded-md text-sm border border-border focus:ring-primary focus:outline-none bg-background text-text"
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
                                className="px-3 py-2 rounded-md text-sm border border-border focus:ring-primary focus:outline-none bg-background text-text"
                            >
                                <option value="">All Subjects</option>
                                {studentSubjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                            <button
                                onClick={resetFilters}
                                className="px-3 py-2 text-sm bg-accent-light hover:bg-accent rounded-md text-text"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[600px] w-full text-sm text-left border-collapse">
                            <thead>
                            <tr className="border-b border-border text-text-light">
                                <th className="p-3 border-b">Sr No</th>
                                <th className="p-3 border-b">Date</th>
                                <th className="p-3 border-b">Subject</th>
                                <th className="p-3 border-b">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAttendanceData.length > 0 ? (
                                filteredAttendanceData.map((entry, index) => (
                                    <motion.tr
                                        key={`${entry.date}-${entry.subjectName}-${index}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.02 }}
                                        className="border-t border-border hover:bg-background"
                                    >
                                        <td className="p-3 border-b">{index + 1}</td>
                                        <td className="p-3 border-b">{entry.date}</td>
                                        <td className="p-3 border-b">{entry.subjectName}</td>
                                        <td className="p-3 border-b">
                                            <StatusBadge status={entry.status}/>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-text-light">
                                        <div className="flex flex-col items-center">
                                            <FaCalendarAlt className="text-text-light text-4xl mb-2"/>
                                            <p className="text-lg">No attendance data found</p>
                                            <p className="text-sm">Try adjusting filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentProfile;