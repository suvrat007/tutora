import { useState, useMemo } from 'react';
import { formatDate, isToday } from '@/utilities/dateUtils';
import {
    Calendar,
    BookOpen,
    Users,
    AlertCircle,
    CheckCircle,
    XCircle,
    PencilIcon,
    Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EditClassModal from './EditClassModal';
import Dropdown from '@/components/ui/Dropdown';

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

const PAGE_SIZE = 15;

const ClassesTable = ({ newClassLogs, onUpdate }) => {
    const [expandedNotes, setExpandedNotes] = useState({});
    const [batchFilter, setBatchFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
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

    const toYYYYMMDD = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const filterOptions = useMemo(() => {
        const batches = [...new Set(newClassLogs.map(log => log.batch_id.name))];
        const subjects = [...new Set(newClassLogs.flatMap(log => log.batch_id.subject.map(s => s.name)))];
        const grades = [...new Set(newClassLogs.map(log => log.batch_id.forStandard))];
        const statuses = ['All', 'Conducted', 'Cancelled', 'No data recorded'];
        return { batches: ['All', ...batches], subjects: ['All', ...subjects], grades: ['All', ...grades], statuses };
    }, [newClassLogs]);

    // Flat sorted list of all matching {log, cls} pairs, newest first
    const allFilteredRows = useMemo(() => {
        const rows = [];
        newClassLogs.forEach(log => {
            log.classes.forEach(cls => {
                const batchMatch = batchFilter === 'All' || log.batch_id.name === batchFilter;
                const subjectMatch = subjectFilter === 'All' || getSubjectName(log.subject_id, log.batch_id) === subjectFilter;
                const gradeMatch = gradeFilter === 'All' || log.batch_id.forStandard === gradeFilter;
                const statusMatch = statusFilter === 'All' || cls.status === statusFilter;
                const clsDate = cls.date?.slice(0, 10); // 'YYYY-MM-DD'
                const dateFromMatch = !dateFrom || clsDate >= dateFrom;
                const dateToMatch = !dateTo || clsDate <= dateTo;
                if (batchMatch && subjectMatch && gradeMatch && statusMatch && dateFromMatch && dateToMatch) rows.push({ log, cls });
            });
        });
        return rows.sort((a, b) => b.cls.date.localeCompare(a.cls.date));
    }, [newClassLogs, batchFilter, subjectFilter, gradeFilter, statusFilter, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(allFilteredRows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pagedRows = allFilteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const changeFilter = (setter) => (val) => { setter(val); setPage(1); };
    const changeDateFrom = (val) => { setDateFrom(val); setPage(1); };
    const changeDateTo = (val) => { setDateTo(val); setPage(1); };;

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

    const handleExportCSV = () => {
        const headers = ['S.No.', 'Batch', 'Grade', 'Subject', 'Date', 'Status', 'Note', 'Attendance Count'];
        const csvRows = [headers.join(',')];

        allFilteredRows.forEach(({ log, cls }, index) => {
            const row = [
                index + 1,
                `"${log.batch_id.name}"`,
                `"${log.batch_id.forStandard}"`,
                `"${getSubjectName(log.subject_id, log.batch_id)}"`,
                `"${formatDate(cls.date)}"`,
                `"${cls.status}"`,
                `"${cls.note?.replace(/"/g, '""') || ''}"`,
                cls.attendance.length
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `class_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="h-full flex flex-col bg-[#f8ede3] overflow-hidden"
        >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 bg-[#f0d9c0] border-b border-[#e6c8a8] flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[#5a4a3c] flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#e6c8a8]"/>
                        Class Management
                    </h2>
                    <p className="text-sm text-[#7b5c4b]">Overview of all scheduled classes</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 h-[38px] bg-[#e0c4a8] hover:bg-[#d0b498] text-[#5a4a3c] text-sm font-semibold rounded-lg shadow-sm transition-colors border border-[#d0b498]"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Filters — always visible */}
            <div className="flex-shrink-0 flex flex-wrap items-end gap-4 p-4 bg-[#f0d9c0] border-b border-[#e6c8a8]">
                {[{
                    label: 'Batch', value: batchFilter, onChange: changeFilter(setBatchFilter), options: filterOptions.batches
                }, {
                    label: 'Subject', value: subjectFilter, onChange: changeFilter(setSubjectFilter), options: filterOptions.subjects
                }, {
                    label: 'Grade', value: gradeFilter, onChange: changeFilter(setGradeFilter), options: filterOptions.grades
                }, {
                    label: 'Status', value: statusFilter, onChange: changeFilter(setStatusFilter), options: filterOptions.statuses
                }].map((filter, i) => (
                    <div key={i} className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-[#7b5c4b] uppercase mb-1">{filter.label}</label>
                        <Dropdown
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            options={filter.options}
                        />
                    </div>
                ))}
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-[#7b5c4b] uppercase mb-1">From Date</label>
                    <input
                        type="date"
                        value={dateFrom}
                        max={dateTo || undefined}
                        onChange={(e) => changeDateFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-[#f0d9c0] focus:ring-[#e0c4a8] focus:outline-none"
                    />
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-[#7b5c4b] uppercase mb-1">To Date</label>
                    <input
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(e) => changeDateTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] bg-[#f0d9c0] focus:ring-[#e0c4a8] focus:outline-none"
                    />
                </div>
            </div>

            {/* Table — only this scrolls */}
            <div className="flex-1 overflow-y-auto min-h-0">
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
                        {pagedRows.length === 0 ? (
                            <motion.tr variants={placeholderVariants} animate="pulse">
                                <td colSpan="8" className="px-6 py-12 text-center text-[#7b5c4b]">
                                    <div className="flex flex-col items-center gap-2">
                                        <Calendar className="w-10 h-10 text-[#e6c8a8]" />
                                        <p className="font-medium">No classes found</p>
                                        <p className="text-xs">Adjust filters or create a new class</p>
                                    </div>
                                </td>
                            </motion.tr>
                        ) : pagedRows.map(({ log, cls }, index) => {
                            const { text, needsReadMore } = truncateNote(cls.note);
                            const isExpanded = expandedNotes[cls._id];
                            const isZeroAttendance = cls.status === 'Conducted' && cls.attendance.length === 0;
                            const serial = (safePage - 1) * PAGE_SIZE + index + 1;

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
                                    <td className="px-4 sm:px-6 py-4">{serial}</td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#e6c8a8] flex items-center justify-center text-xs font-semibold text-[#5a4a3c]">
                                                {log.batch_id.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="max-w-[120px] truncate font-medium" title={log.batch_id.name}>
                                                    {log.batch_id.name}
                                                </div>
                                                <p className="text-xs text-[#7b5c4b]">Grade {log.batch_id.forStandard}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-[#e6c8a8]" />
                                            <div className="max-w-[120px] truncate" title={getSubjectName(log.subject_id, log.batch_id)}>
                                                {getSubjectName(log.subject_id, log.batch_id)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <p>{formatDate(cls.date)}</p>
                                        <p className="text-xs text-[#7b5c4b]">{new Date(cls.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
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
                                                <button onClick={() => toggleNote(cls._id)} className="text-xs text-[#5a4a3c] hover:text-[#e0c4a8] font-medium whitespace-nowrap">
                                                    {isExpanded ? 'Read Less' : 'Read More'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="group relative flex items-center gap-2">
                                            <div
                                                className={`flex items-center gap-2 ${isZeroAttendance ? 'bg-red-100 px-3 py-1 rounded-lg cursor-pointer' : ''}`}
                                                onClick={() => isZeroAttendance && navigate('/main/attendance', {
                                                    state: {
                                                        batchName: log.batch_id.name,
                                                        subjectName: getSubjectName(log.subject_id, log.batch_id),
                                                        date: toYYYYMMDD(cls.date),
                                                    }
                                                })}
                                            >
                                                <Users className="w-4 h-4 text-[#e6c8a8]" />
                                                <div>
                                                    <p className={`font-semibold ${isZeroAttendance ? 'text-red-700' : ''}`}>{cls.attendance.length}</p>
                                                    <p className="text-xs text-[#7b5c4b]">Present</p>
                                                </div>
                                            </div>
                                            {isZeroAttendance && (
                                                <span className="absolute left-0 -top-10 hidden group-hover:block bg-[#5a4a3c] text-white text-xs rounded-lg py-1 px-2 shadow-lg whitespace-nowrap">
                                                    Click to mark attendance
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        {cls.status === 'No data recorded' && !isToday(cls.date) && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
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
                        })}
                    </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination — always visible */}
            {totalPages > 1 && (
                <div className="flex-shrink-0 bg-[#f0d9c0] px-6 py-3 border-t border-[#e6c8a8] flex items-center justify-between">
                    <span className="text-sm font-medium text-[#7b5c4b]">
                        {allFilteredRows.length} classes &middot; Page {safePage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(1)}
                            disabled={safePage === 1}
                            className="px-2 py-1.5 text-xs rounded-md border border-[#e0c4a8] bg-[#f8ede3] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition text-[#5a4a3c] font-medium"
                        >«</button>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="px-3 py-1.5 text-sm rounded-md border border-[#e0c4a8] bg-[#f8ede3] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition text-[#5a4a3c] font-medium"
                        >Prev</button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((item, i) =>
                                item === '…' ? (
                                    <span key={`ellipsis-${i}`} className="px-2 text-[#7b5c4b] text-sm">…</span>
                                ) : (
                                    <button
                                        key={item}
                                        onClick={() => setPage(item)}
                                        className={`px-3 py-1.5 text-sm rounded-md border transition font-medium ${
                                            item === safePage
                                                ? 'bg-[#e0c4a8] border-[#d0b498] text-[#5a4a3c]'
                                                : 'bg-[#f8ede3] border-[#e0c4a8] text-[#5a4a3c] hover:bg-white'
                                        }`}
                                    >{item}</button>
                                )
                            )
                        }

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="px-3 py-1.5 text-sm rounded-md border border-[#e0c4a8] bg-[#f8ede3] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition text-[#5a4a3c] font-medium"
                        >Next</button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={safePage === totalPages}
                            className="px-2 py-1.5 text-xs rounded-md border border-[#e0c4a8] bg-[#f8ede3] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition text-[#5a4a3c] font-medium"
                        >»</button>
                    </div>
                </div>
            )}

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