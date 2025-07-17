import {useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Users, PencilIcon,BookOpen, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import EditClassModal from "@/pages/InstiInfo/EditClassModal.jsx";

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
            case 'Conducted': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'Cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <AlertCircle className="w-4 h-4 text-amber-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Conducted': return 'bg-green-100 text-green-800 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    const truncateNote = (note) => {
        if (!note || note === 'No Data') return { text: note || '—', needsReadMore: false };
        const words = note.trim().split(/\s+/);
        if (words.length <= 6) return { text: note, needsReadMore: false };
        return { text: words.slice(0, 6).join(' ') + '...', needsReadMore: true };
    };

    const toggleNote = (classId) => {
        setExpandedNotes(prev => ({ ...prev, [classId]: !prev[classId] }));
    };

    const filterOptions = useMemo(() => {
        const batches = [...new Set(newClassLogs.map(log => log.batch_id.name))];
        const subjects = [...new Set(newClassLogs.flatMap(log => log.batch_id.subject.map(s => s.name)))];
        const grades = [...new Set(newClassLogs.map(log => log.batch_id.forStandard))];
        const statuses = ['All', 'Conducted', 'Cancelled', 'No data recorded'];
        return { batches: ['All', ...batches], subjects: ['All', ...subjects], grades: ['All', ...grades], statuses };
    }, [newClassLogs]);

    const filteredLogs = useMemo(() => {
        return newClassLogs.map(log => ({
            ...log,
            classes: log.classes.filter(cls => {
                const batchMatch = batchFilter === 'All' || log.batch_id.name === batchFilter;
                const subjectMatch = subjectFilter === 'All' || getSubjectName(log.subject_id, log.batch_id) === subjectFilter;
                const gradeMatch = gradeFilter === 'All' || log.batch_id.forStandard === gradeFilter;
                const statusMatch = statusFilter === 'All' || cls.status === statusFilter;
                return batchMatch && subjectMatch && gradeMatch && statusMatch;
            })
        })).filter(log => log.classes.length > 0);
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

    return (
        <div className="h-full overflow-hidden">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 p-4 bg-[#d7b48f]/10 border-b border-[#ddb892]">
                {[{
                    label: 'Batch', value: batchFilter, onChange: setBatchFilter, options: filterOptions.batches
                }, {
                    label: 'Subject', value: subjectFilter, onChange: setSubjectFilter, options: filterOptions.subjects
                }, {
                    label: 'Grade', value: gradeFilter, onChange: setGradeFilter, options: filterOptions.grades
                }, {
                    label: 'Status', value: statusFilter, onChange: setStatusFilter, options: filterOptions.statuses
                }].map((filter, i) => (
                    <div key={i} className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-medium text-[#6b4c3b] uppercase mb-1">{filter.label}</label>
                        <select
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="w-full p-2 rounded-lg border border-[#ddb892] text-sm bg-[#e7c6a5] text-[#4a3a2c] focus:ring-2 focus:ring-[#d7b48f] focus:border-[#d7b48f] transition-colors duration-200"
                        >
                            {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="h-[calc(100%-100px)] overflow-auto">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-[#d7b48f]/20 sticky top-0 z-10">
                        <tr>
                            {['S.No.', 'Batch', 'Subject', 'Date', 'Status', 'Note', 'Attendance', ''].map((label, i) => (
                                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-[#4a3a2c] uppercase tracking-wider border-b border-[#ddb892]">
                                    {label}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="bg-[#f4e3d0] text-sm text-[#4a3a2c]">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-[#6b4c3b]">
                                    <div className="flex flex-col items-center gap-3">
                                        <Calendar className="w-12 h-12 text-[#6b4c3b]" />
                                        <p className="font-medium text-lg">No classes found</p>
                                        <p className="text-sm">Adjust filters or create a new class</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (() => {
                            let serial = 1;
                            return filteredLogs.flatMap(log =>
                                log.classes.map(cls => {
                                    const { text, needsReadMore } = truncateNote(cls.note);
                                    const isExpanded = expandedNotes[cls._id];
                                    const isZeroAttendance = cls.status === 'Conducted' && cls.attendance.length === 0;

                                    return (
                                        <motion.tr
                                            key={cls._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="hover:bg-[#e7c6a5]/50 border-b border-[#ddb892]/50 transition-colors duration-200"
                                        >
                                            <td className="px-4 py-4 font-medium">{serial++}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#d7b48f] flex items-center justify-center text-xs font-bold text-[#4a3a2c]">
                                                        {log.batch_id.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#4a3a2c]">{log.batch_id.name}</p>
                                                        <p className="text-xs text-[#6b4c3b]">Grade {log.batch_id.forStandard}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-[#6b4c3b]" />
                                                    <span className="font-medium">{getSubjectName(log.subject_id, log.batch_id)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-medium">{moment(cls.date).format('MMM DD, YYYY')}</p>
                                                <p className="text-xs text-[#6b4c3b]">{moment(cls.date).format('dddd')}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cls.status)}`}>
                                                        {getStatusIcon(cls.status)} {cls.status}
                                                    </span>
                                            </td>
                                            <td className="px-4 py-4 max-w-xs">
                                                <div className="flex items-center gap-2">
                                                    <p className={`${isExpanded ? '' : 'truncate'} text-sm`} title={cls.note}>
                                                        {isExpanded ? cls.note || '—' : text}
                                                    </p>
                                                    {needsReadMore && (
                                                        <button
                                                            onClick={() => toggleNote(cls._id)}
                                                            className="text-xs text-[#6b4c3b] hover:text-[#4a3a2c] font-medium bg-[#d7b48f]/30 px-2 py-1 rounded transition-colors duration-200"
                                                        >
                                                            {isExpanded ? 'Less' : 'More'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="group relative flex items-center gap-2">
                                                    <div
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                                            isZeroAttendance
                                                                ? 'bg-red-100 border border-red-200 cursor-pointer hover:bg-red-150'
                                                                : 'bg-[#d7b48f]/20 border border-[#ddb892]'
                                                        }`}
                                                        onClick={() => isZeroAttendance && navigate('/main/attendance')}
                                                    >
                                                        <Users className="w-4 h-4 text-[#6b4c3b]" />
                                                        <div>
                                                            <p className={`font-bold ${isZeroAttendance ? 'text-red-600' : 'text-[#4a3a2c]'}`}>
                                                                {cls.attendance.length}
                                                            </p>
                                                            <p className="text-xs text-[#6b4c3b]">Present</p>
                                                        </div>
                                                    </div>
                                                    {isZeroAttendance && (
                                                        <div className="absolute left-0 -top-12 hidden group-hover:block bg-[#4a3a2c] text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap z-10">
                                                            Click to Mark Attendance
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#4a3a2c]"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {cls.status === 'No data recorded' && !moment(cls.date).isSame(moment('2025-07-13'), 'day') && (
                                                    <button
                                                        onClick={() => handleEditClass(log, cls)}
                                                        className="text-[#6b4c3b] hover:text-[#4a3a2c] bg-[#d7b48f]/30 p-2 rounded-lg hover:bg-[#d7b48f]/50 transition-colors duration-200"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            );
                        })()}
                        </tbody>
                    </table>
                </div>
            </div>

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