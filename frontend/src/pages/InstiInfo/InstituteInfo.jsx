import { useSelector } from 'react-redux';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Phone, Mail, GraduationCap, Calendar, Users, PencilIcon, X, Loader2, BookOpen, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/utilities/axiosInstance';
import moment from 'moment';
import toast from 'react-hot-toast';
import useClassLogProcessor from './useClassLogProcessor';
import useFetchClassLogs from '@/pages/useFetchClassLogs.js';
import useFetchUser from '@/pages/useFetchUser.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import ClassesTable from "@/pages/InstiInfo/ClassesTable.jsx";
import LoadingPage from "@/pages/LoadingPage.jsx";
import EditInfoModal from "@/pages/InstiInfo/EditInfoModal.jsx";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const InstituteInfo = () => {
    const classLogs = useSelector((state) => state.classlogs);
    const batches = useSelector((state) => state.batches);
    const userData = useSelector((state) => state.user);
    const instiData = userData?.institute_info || { contact_info: {} };

    const [showEditModal, setShowEditModal] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const fetchClassLogs = useFetchClassLogs();
    const newClassLogs = useClassLogProcessor(classLogs, batches);

    const onUpdate = async () => {
        await fetchClassLogs();
    };

    if (!loaded) return <LoadingPage onDone={() => setLoaded(true)} />;

    return (
        <div className="min-h-screen overflow-y-auto">
            {showEditModal && (
                <EditInfoModal
                    onClose={() => setShowEditModal(false)}
                    isOpen={showEditModal}
                    initialData={userData}
                />
            )}

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl lg:text-3xl font-bold text-[#4a3a2c]">Institute Information</h1>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="p-2 bg-[#f4e3d0] rounded-lg shadow-md border border-[#ddb892] hover:bg-[#d7b48f] transition-colors duration-200"
                        >
                            <PencilIcon className="w-5 h-5 text-[#4a3a2c]" />
                        </button>
                    </div>
                </div>

                {/* Top Cards Grid */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                >
                    {/* Admin Card */}
                    <motion.div
                        variants={fadeInUp}
                        className="bg-[#f4e3d0] rounded-xl shadow-lg border border-[#ddb892] p-6 flex flex-col items-center justify-center text-center min-h-[280px]"
                    >
                        <div className="rounded-2xl bg-[#d7b48f]/20 p-2 shadow-inner">
                            <img
                                src={userData.adminPicURL}
                                alt="Admin Avatar"
                                className="w-24 h-24 object-cover rounded-2xl border-2 border-[#ddb892] bg-[#f4e3d0]"
                            />
                        </div>
                        <div className="space-y-2 mt-4">
                            <h2 className="text-lg font-semibold text-[#4a3a2c]">Admin</h2>
                            <p className="text-sm text-[#6b4c3b] flex items-center justify-center gap-2">
                                <Users className="w-4 h-4" />
                                {userData.name}
                            </p>
                            <p className="text-sm text-[#6b4c3b] flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" />
                                {userData.emailId}
                            </p>
                        </div>
                    </motion.div>

                    {/* Logo Card */}
                    <motion.div
                        variants={fadeInUp}
                        className="bg-[#f4e3d0] rounded-xl shadow-lg border border-[#ddb892] p-6 flex items-center justify-center min-h-[280px]"
                    >
                        <div className="relative w-[90%] h-[90%]">
                            <div className="rounded-xl shadow-inner w-full h-full flex items-center justify-center bg-[#d7b48f]/10">
                                {instiData?.logo_URL ? (
                                    <img
                                        src={instiData.logo_URL}
                                        alt="Institute Logo"
                                        className="h-full w-full object-cover rounded-xl border-2 border-[#ddb892]"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center relative">
                                        <div className="animate-pulse w-14 h-14 bg-[#d7b48f]/20 rounded-full absolute" style={{ animationDelay: '0s' }}></div>
                                        <div className="animate-pulse w-20 h-20 bg-[#d7b48f]/15 rounded-full absolute" style={{ animationDelay: '0.5s' }}></div>
                                        <div className="animate-pulse w-24 h-24 bg-[#d7b48f]/10 rounded-full absolute" style={{ animationDelay: '1s' }}></div>
                                        <div className="z-10 bg-[#d7b48f] text-[#4a3a2c] p-6 w-16 h-16 flex items-center justify-center rounded-full font-bold text-xl shadow-md">
                                            {instiData.name ? instiData.name.charAt(0) : 'I'}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#f4e3d0] border-2 border-[#ddb892] rounded-full flex items-center justify-center shadow-md">
                                <GraduationCap className="w-4 h-4 text-[#4a3a2c]" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Institute Info Card */}
                    <motion.div
                        variants={fadeInUp}
                        className="bg-[#f4e3d0] rounded-xl shadow-lg border border-[#ddb892] p-6 flex flex-col justify-between min-h-[280px]"
                    >
                        <h2 className="text-lg font-semibold text-[#4a3a2c] flex items-center gap-2 mb-4">
                            <Building2 className="w-5 h-5 text-[#6b4c3b]" />
                            Institute Info
                        </h2>
                        <div className="space-y-3 text-sm">
                            {[{
                                Icon: Building2,
                                label: 'Name',
                                value: instiData.name || 'Not Set'
                            }, {
                                Icon: Phone,
                                label: 'Phone',
                                value: instiData.contact_info.phone_number || 'Not Set'
                            }, {
                                Icon: Mail,
                                label: 'Email',
                                value: instiData.contact_info.emailId || 'Not Set'
                            }].map(({ Icon, label, value }, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-[#e7c6a5]/30 rounded-lg border border-[#ddb892]/50">
                                    <Icon className="w-4 h-4 text-[#6b4c3b] mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[#6b4c3b] font-medium">{label}</p>
                                        <p className="text-[#4a3a2c] font-semibold truncate" title={value}>{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Classes Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-[#f4e3d0] rounded-xl shadow-lg border border-[#ddb892] overflow-hidden flex flex-col"
                    style={{ height: 'calc(100vh - 480px)', minHeight: '400px' }}
                >
                    <div className="px-6 py-4 bg-[#d7b48f]/20 border-b border-[#ddb892]">
                        <h2 className="text-xl font-semibold text-[#4a3a2c] flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#6b4c3b]" />
                            Class Management
                        </h2>
                        <p className="text-sm text-[#6b4c3b] mt-1">Overview of all scheduled classes</p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ClassesTable newClassLogs={newClassLogs} onUpdate={onUpdate} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default InstituteInfo;