import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Phone, Mail, Users, BookOpen, PencilIcon, GraduationCap } from 'lucide-react';

import processClassLogs from './useClassLogProcessor';
import useFetchClassLogs from '@/hooks/useFetchClassLogs.js';
import ClassesTable from './ClassesTable';
import EditInfoModal from '@/pages/InstiInfo/EditInfoModal.jsx';

const InstituteInfo = () => {
    const classLogs = useSelector((state) => state.classlogs);
    const batches = useSelector((state) => state.batches);
    const userData = useSelector((state) => state.user);
    const groupedStudents = useSelector((state) => state.students.groupedStudents) || [];
    const instiData = userData?.institute_info || { contact_info: {} };
    const fetchClassLogs = useFetchClassLogs();

    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => { fetchClassLogs().catch(console.error); }, []);

    const newClassLogs = useMemo(() => processClassLogs(classLogs, batches), [classLogs, batches]);
    const totalStudents = groupedStudents.reduce((acc, g) => acc + (g.students?.length || 0), 0);

    return (
        <div className="h-full p-3 sm:p-5 overflow-y-auto no-scrollbar flex flex-col gap-4">
            {showEditModal && (
                <EditInfoModal onClose={() => setShowEditModal(false)} isOpen={showEditModal} initialData={userData} />
            )}

            {/* ── Profile card ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="shrink-0 bg-[#f8ede3] rounded-2xl border border-[#e6c8a8] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden"
            >
                {/* Top band */}
                <div className="bg-[#f0d9c0] px-5 py-3 flex items-center justify-between border-b border-[#e6c8a8]">
                    <h1 className="text-base font-bold text-[#5a4a3c] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#c47d3e]" />
                        Institute Center
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#e0c4a8] border border-[#d0b498] text-[#5a4a3c] rounded-lg hover:bg-[#d7b48f] transition"
                    >
                        <PencilIcon className="w-3.5 h-3.5" /> Edit Info
                    </motion.button>
                </div>

                {/* Main content */}
                <div className="flex flex-col sm:flex-row gap-5 p-5">
                    {/* Logo */}
                    <div className="shrink-0 flex items-start justify-center sm:justify-start">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#e0c4a8] border border-[#d0b498] overflow-hidden shadow-inner flex items-center justify-center">
                            {instiData?.logo_URL ? (
                                <img src={instiData.logo_URL} alt="Institute Logo" className="w-full h-full object-contain" />
                            ) : (
                                <GraduationCap className="w-10 h-10 text-[#8b5e3c]" />
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4">
                        {/* Institute name */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#5a4a3c] leading-tight truncate">
                                {instiData.name || 'Institute Name'}
                            </h2>
                        </div>

                        {/* Two columns: institute contact + admin info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Institute contact */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-[#a08070] uppercase tracking-wider">Institute</p>
                                {[
                                    { Icon: Phone, value: instiData.contact_info?.phone_number || 'N/A' },
                                    { Icon: Mail, value: instiData.contact_info?.emailId || 'N/A' },
                                ].map(({ Icon, value }, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-[#5a4a3c]">
                                        <Icon className="w-3.5 h-3.5 text-[#c47d3e] shrink-0" />
                                        <span className="truncate">{value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Admin info */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-[#a08070] uppercase tracking-wider">Admin</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#e0c4a8] border border-[#d0b498] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {userData?.adminPicURL ? (
                                            <img src={userData.adminPicURL} alt="Admin" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-[#5a4a3c]">
                                                {userData?.name?.[0]?.toUpperCase() || 'A'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[#5a4a3c] truncate">{userData?.name || 'N/A'}</p>
                                        <p className="text-xs text-[#7b5c4b] truncate">{userData?.emailId || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="flex divide-x divide-[#e6c8a8] border-t border-[#e6c8a8] bg-[#f0d9c0]">
                    {[
                        { icon: <BookOpen className="w-4 h-4 text-[#c47d3e]" />, label: 'Batches', value: batches.length },
                        { icon: <Users className="w-4 h-4 text-[#c47d3e]" />, label: 'Students', value: totalStudents },
                        { icon: <GraduationCap className="w-4 h-4 text-[#c47d3e]" />, label: 'Subjects', value: batches.reduce((a, b) => a + (b.subject?.length || 0), 0) },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="flex-1 flex items-center justify-center gap-2 py-3">
                            {icon}
                            <div className="text-center">
                                <p className="text-base font-bold text-[#5a4a3c] leading-none">{value}</p>
                                <p className="text-[10px] text-[#7b5c4b] font-medium">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Classes Table ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="flex-1 min-h-[520px] flex flex-col rounded-2xl border border-[#e6c8a8] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden"
            >
                <ClassesTable newClassLogs={newClassLogs} onUpdate={fetchClassLogs} />
            </motion.div>
        </div>
    );
};

export default InstituteInfo;
