import { useState, useMemo } from 'react';
import moment from 'moment';
import {
    Calendar,
    BookOpen,
    Users,
    AlertCircle,
    CheckCircle,
    XCircle,
    PencilIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EditClassModal from './EditClassModal';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
    }),
};

const placeholderVariants = {
    pulse: {
        scale: [1, 1.1, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
};

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
            case 'Cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Conducted': return 'bg-green-50 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
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
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="h-full overflow-y-auto bg-[#f8ede3] rounded-b-2xl border border-[#e6c8a8] shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
        >
            <div className="flex flex-wrap gap-4 p-4 bg-[#f0d9c0] border-b border-[#e6c8a8]">
                {[{
                    label: 'Batch', value: batchFilter, onChange: setBatchFilter, options: filterOptions.batches
                }, {
                    label: 'Subject', value: subjectFilter, onChange: setSubjectFilter, options: filterOptions.subjects
                }, {
                    label: 'Grade', value: gradeFilter, onChange: setGradeFilter, options: filterOptions.grades
                }, {
                    label: 'Status', value: statusFilter, onChange: setStatusFilter, options: filterOptions.statuses
                }].map((filter, i) => (
                    <div key={i} className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-[#7b5c4b] uppercase mb-1">{filter.label}</label>
                        <select
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-[#f0d9c0] focus:ring-[#e0c4a8] focus:outline-none"
                        >
                            {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-y-auto h-full rounded-b-2xl border-t border-[#e6c8a8]">
                <table className="min-w-[600px] w-full divide-y divide-[#e6c8a8] border-collapse">
                    <thead className="bg-[#f0d9c0] sticky top-0 z-10">
                    <tr>
                        {['S.No.', 'Batch', 'Subject', 'Date', 'Status', 'Note', 'Attendance', ''].map((label, i) => (
                            <th key={i} className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-[#7b5c4b] uppercase">{label}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-[#f8ede3] divide-y divide-[#e6c8a8] text-sm text-[#5a4a3c]">
                    <AnimatePresence>
                        {filteredLogs.length === 0 ? (
                            <motion.tr
                                variants={placeholderVariants}
                                animate="pulse"
                                className="border-b border-[#e6c8a8]"
                            >
                                <td colSpan="8" className="px-6 py-12 text-center text-[#7b5c4b] overflow-hidden">
                                    <div className="flex flex-col items-center gap-2">
                                        <Calendar className="w-10 h-10 text-[#e6c8a8]" />
                                        <p className="font-medium">No classes found</p>
                                        <p className="text-xs">Adjust filters or create a new class</p>
                                    </div>
                                </td>
                            </motion.tr>
                        ) : (() => {
                            let serial = 1;
                            return filteredLogs.flatMap(log =>
                                    log.classes.map((cls, index) => {
                                        const { text, needsReadMore } = truncateNote(cls.note);
                                        const isExpanded = expandedNotes[cls._id];
                                        const isZeroAttendance = cls.status === 'Conducted' && cls.attendance.length === 0;

                                        return (
                                            <motion.tr
                                                key={cls._id}
                                                custom={index}
                                                variants={cardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                className="hover:bg-[#e0c4a8]/50 transition"
                                            >
                                                <td className="px-4 sm:px-6 py-4">{serial++}</td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#e6c8a8] flex items-center justify-center text-xs font-semibold text-[#5a4a3c]">
                                                            {log.batch_id.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-wrap">
                                                                <div className="max-w-[120px] truncate" title={log.batch_id.name}>
                                                                    {log.batch_id.name}
                                                                </div>
                                                            </p>
                                                            <p className="text-xs text-[#7b5c4b]">Grade {log.batch_id.forStandard}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-[#e6c8a8]" />
                                                    <div className="max-w-[120px] truncate" title={getSubjectName(log.subject_id, log.batch_id)}>
                                                        {getSubjectName(log.subject_id, log.batch_id)}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <p>{moment(cls.date).format('MMM DD, YYYY')}</p>
                                                    <p className="text-xs text-[#7b5c4b]">{moment(cls.date).format('dddd')}</p>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cls.status)}`}>
                            {getStatusIcon(cls.status)} {cls.status}
                          </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 max-w-xs">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`${isExpanded ? '' : 'truncate'} text-sm`} title={cls.note}>
                                                            {isExpanded ? cls.note || '—' : text}
                                                        </p>
                                                        {needsReadMore && (
                                                            <button
                                                                onClick={() => toggleNote(cls._id)}
                                                                className="text-xs text-[#5a4a3c] hover:text-[#e0c4a8] font-medium"
                                                            >
                                                                {isExpanded ? 'Read Less' : 'Read More'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="group relative flex items-center gap-2">
                                                        <div
                                                            className={`flex items-center gap-2 ${isZeroAttendance ? 'bg-red-100 px-3 py-1 rounded-lg' : ''}`}
                                                            onClick={() => isZeroAttendance && navigate('/main/attendance')}
                                                        >
                                                            <Users className="w-4 h-4 text-[#e6c8a8]" />
                                                            <div>
                                                                <p className={`font-semibold ${isZeroAttendance ? 'text-red-700' : ''}`}>
                                                                    {cls.attendance.length}
                                                                </p>
                                                                <p className="text-xs text-[#7b5c4b]">Present</p>
                                                            </div>
                                                        </div>
                                                        {isZeroAttendance && (
                                                            <span className="absolute left-0 -top-10 hidden group-hover:block bg-[#5a4a3c] text-white text-xs rounded-lg py-1 px-2 shadow-lg">
                                Please Click to Mark Attendance
                              </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4">
                                                    {cls.status === 'No data recorded' && !moment(cls.date).isSame(moment('2025-07-13'), 'day') && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleEditClass(log, cls)}
                                                            className="text-[#5a4a3c] hover:text-[#e0c4a8]"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </motion.button>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                            );
                        })()}
                    </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <EditClassModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                classInfo={selectedClass}
                onUpdate={onUpdate}
            />
        </motion.div>
    );
};

export default ClassesTable;