import { useState, useMemo } from 'react';
import moment from 'moment';
import {
    Calendar, BookOpen, Users, AlertCircle, CheckCircle, XCircle, PencilIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditClassModal from './EditClassModal';

const ClassesTable = ({ newClassLogs, onUpdate }) => {
    const [expandedNotes, setExpandedNotes] = useState({});
    const [batchFilter, setBatchFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const navigate = useNavigate();

    const getSubjectName = (subjectId, batch) => {
        const subject = batch.subject.find(s => s._id.toString() === subjectId.toString());
        return subject ? subject.name : 'Unknown';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Conducted':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'Cancelled':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Conducted':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'Cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
    };

    const truncateNote = (note) => {
        if (!note || note === 'No Data') return { text: note || '—', needsReadMore: false };
        const words = note.trim().split(/\s+/);
        if (words.length <= 6) return { text: note, needsReadMore: false };
        return { text: words.slice(0, 6).join(' ') + '...', needsReadMore: true };
    };

    const toggleNote = (classId) => {
        setExpandedNotes((prev) => ({
            ...prev,
            [classId]: !prev[classId],
        }));
    };

    const filterOptions = useMemo(() => {
        const batches = [...new Set(newClassLogs.map(log => log.batch_id.name))];
        const subjects = [
            ...new Set(
                newClassLogs.flatMap(log =>
                    log.batch_id.subject.map(s => s.name)
                )
            )
        ];
        const grades = [...new Set(newClassLogs.map(log => log.batch_id.forStandard))];
        const statuses = ['All', 'Conducted', 'Cancelled', 'No data recorded'];

        return { batches: ['All', ...batches], subjects: ['All', ...subjects], grades: ['All', ...grades], statuses };
    }, [newClassLogs]);

    const filteredLogs = useMemo(() => {
        const logs = newClassLogs.map(log => ({
            ...log,
            classes: log.classes.filter(cls => {
                const batchMatch = batchFilter === 'All' || log.batch_id.name === batchFilter;
                const subjectMatch = subjectFilter === 'All' || getSubjectName(log.subject_id, log.batch_id) === subjectFilter;
                const gradeMatch = gradeFilter === 'All' || log.batch_id.forStandard === gradeFilter;
                const statusMatch = statusFilter === 'All' || cls.status === statusFilter;
                return batchMatch && subjectMatch && gradeMatch && statusMatch;
            })
        })).filter(log => log.classes.length > 0);

        // Debug: Log filtered logs to verify today's classes
        console.log('Filtered logs:', logs);
        return logs;
    }, [newClassLogs, batchFilter, subjectFilter, gradeFilter, statusFilter]);

    const handleEditClass = (log, cls) => {
        setSelectedClass({
            batch_id: log.batch_id._id,
            batchName: log.batch_id.name,
            subject_id: log.subject_id,
            subjectName: getSubjectName(log.subject_id, log.batch_id),
            date: cls.date,
            classId: cls._id,
            hasHeld: cls.hasHeld,
            note: cls.note,
        });
        setModalOpen(true);
    };

    // Check if a class is scheduled for today (July 13, 2025)
    const isToday = (date) => {
        return moment(date).isSame(moment('2025-07-13'), 'day');
    };

    return (
        <div className="h-full overflow-hidden">
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Batch</label>
                    <select
                        value={batchFilter}
                        onChange={(e) => setBatchFilter(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {filterOptions.batches.map(batch => (
                            <option key={batch} value={batch}>{batch}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Subject</label>
                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {filterOptions.subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Grade</label>
                    <select
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {filterOptions.grades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {filterOptions.statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="h-[calc(100%-80px)] overflow-y-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        {['S.No.', 'Batch', 'Subject', 'Date', 'Status', 'Note', 'Attendance', ''].map((label, i) => (
                            <th
                                key={i}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {label}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm text-gray-700">
                    {filteredLogs.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                    <Calendar className="w-10 h-10 text-gray-300" />
                                    <p className="font-medium">No classes found</p>
                                    <p className="text-xs">Adjust filters or create a new class</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredLogs.flatMap(log =>
                            log.classes.map((cls, index) => {
                                const { text, needsReadMore } = truncateNote(cls.note);
                                const isExpanded = expandedNotes[cls._id];
                                const isZeroAttendance = cls.status === 'Conducted' && cls.attendance.length === 0;

                                return (
                                    <tr key={cls._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">{index + 1}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                                    {log.batch_id.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{log.batch_id.name}</p>
                                                    <p className="text-xs text-gray-500">Grade {log.batch_id.forStandard}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-gray-500" />
                                                {getSubjectName(log.subject_id, log.batch_id)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p>{moment(cls.date).format('MMM DD, YYYY')}</p>
                                                <p className="text-xs text-gray-500">{moment(cls.date).format('dddd')}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cls.status)}`}
                                                >
                                                    {getStatusIcon(cls.status)}
                                                    {cls.status}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex items-center gap-2">
                                                <p
                                                    className={`${isExpanded ? '' : 'truncate'} text-sm text-gray-700`}
                                                    title={isExpanded ? '' : cls.note}
                                                >
                                                    {isExpanded ? cls.note || '—' : text}
                                                </p>
                                                {needsReadMore && (
                                                    <button
                                                        onClick={() => toggleNote(cls._id)}
                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        {isExpanded ? 'Read Less' : 'Read More'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="group relative flex items-center gap-2">
                                                <div
                                                    className={`flex items-center gap-2 ${isZeroAttendance ? 'bg-red-100 px-3 py-1 rounded-lg' : ''}`}
                                                    onClick={() => isZeroAttendance && navigate('/main/attendance')}
                                                >
                                                    <Users className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className={`font-semibold ${isZeroAttendance ? 'text-red-700' : ''}`}>
                                                            {cls.attendance.length}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Present</p>
                                                    </div>
                                                </div>
                                                {isZeroAttendance && (
                                                    <span className="absolute left-0 -top-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-1 px-2 shadow-lg">
                                                            Please Click to Mark Attendance
                                                        </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {cls.status === 'No data recorded' && !moment(cls.date).isSame(moment('2025-07-13'), 'day') && (
                                                <button
                                                    onClick={() => handleEditClass(log, cls)}
                                                    className="text-[#4a3a2c] hover:text-[#2f231a]"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )
                    )}
                    </tbody>
                </table>
            </div>

            {/* Edit Class Modal */}
            <EditClassModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                classInfo={selectedClass}
                onUpdate={onUpdate}
            />
        </div>
    );
};

export default ClassesTable;