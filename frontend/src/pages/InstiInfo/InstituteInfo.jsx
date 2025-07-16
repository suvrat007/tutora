import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, Phone, Mail, GraduationCap, Calendar, Users, PencilIcon
} from 'lucide-react';

import useClassLogProcessor from './useClassLogProcessor';
import useFetchClassLogs from '@/pages/useFetchClassLogs.js';
import useFetchBatches from '@/pages/useFetchBatches.js';
import useFetchStudents from '@/pages/useFetchStudents.js';
import useFetchAttendanceSummary from '@/pages/useFetchAttendanceSummary.js';

import ClassesTable from './ClassesTable';
import WrapperCard from '@/utilities/WrapperCard.jsx';
import EditInfoModal from '@/pages/InstiInfo/EditInfoModal.jsx';
import LoadingPage from '@/pages/LoadingPage.jsx';

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

    const fetchClassLogs = useFetchClassLogs();

    const newClassLogs = useClassLogProcessor(classLogs, batches);

    const onUpdate = async () => {
        await fetchClassLogs();
    };

    const [loaded, setLoaded] = useState(false);

    if (!loaded) return <LoadingPage onDone={() => setLoaded(true)} />;

    return (
        <div className="h-screen p-6 overflow-y-auto">
            {showEditModal && (
                <EditInfoModal
                    onClose={() => setShowEditModal(false)}
                    isOpen={showEditModal}
                    initialData={userData}
                />
            )}

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-[#4a3a2c]">Edit Info</h1>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="p-2 bg-[#fdf5ec] rounded-lg shadow border border-[#e7c6a5] hover:shadow-md transition"
                        >
                            <PencilIcon className="w-5 h-5 text-[#4a3a2c]" />
                        </button>
                    </div>
                </div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                >
                    {/* Admin Info */}
                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="flex gap-10 bg-[#fdf5ec] rounded-xl h-full items-center justify-center text-center p-4">
                                <div className="rounded-2xl bg-[#e7c6a5] p-1 shadow-inner">
                                    <img
                                        src={userData.adminPicURL}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover rounded-2xl border border-[#4a3a2c] bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold text-[#4a3a2c]">Admin</h2>
                                    <p className="text-sm text-[#9b8778] flex items-center justify-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {userData.name}
                                    </p>
                                    <p className="text-sm text-[#9b8778] flex items-center justify-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {userData.emailId}
                                    </p>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>

                    {/* Logo Display */}
                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="flex justify-center items-center bg-[#fdf5ec] rounded-xl h-full p-6">
                                <div className="relative w-[90%] h-[90%]">
                                    <div className="rounded-xl shadow-inner w-full h-full flex items-center justify-center">
                                        {instiData?.logo_URL ? (
                                            <img
                                                src={instiData.logo_URL}
                                                alt="Institute Logo"
                                                className="h-full w-full object-cover rounded-xl border border-[#4a3a2c]"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center relative">
                                                <div className="animate-ring w-14 h-14" style={{ animationDelay: '0s' }}></div>
                                                <div className="animate-ring w-20 h-20" style={{ animationDelay: '0.5s' }}></div>
                                                <div className="animate-ring w-24 h-24" style={{ animationDelay: '1s' }}></div>
                                                <div className="z-10 bg-[#4a3a2c] text-white p-6 w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm shadow-md">
                                                    Tutora
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow">
                                        <GraduationCap className="w-4 h-4 text-[#4a3a2c]" />
                                    </div>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>

                    {/* Institute Info */}
                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="bg-[#fdf5ec] rounded-xl h-full p-4 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-[#4a3a2c] flex items-center gap-2 mb-4">
                                        <Building2 className="w-5 h-5 text-[#4a3a2c]" />
                                        Institute Info
                                    </h2>
                                    <div className="space-y-2 text-sm">
                                        {[{
                                            Icon: Building2,
                                            label: 'Name',
                                            value: instiData.name
                                        }, {
                                            Icon: Phone,
                                            label: 'Phone',
                                            value: instiData.contact_info.phone_number || 'N/A'
                                        }, {
                                            Icon: Mail,
                                            label: 'Email',
                                            value: instiData.contact_info.emailId || 'N/A'
                                        }].map(({ Icon, label, value }, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-[#fff] rounded-md border border-[#e7c6a5]">
                                                <Icon className="w-4 h-4 text-[#4a3a2c] mt-0.5" />
                                                <div>
                                                    <p className="text-[#9b8778]">{label}</p>
                                                    <p className="text-[#4a3a2c] font-medium">{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>
                </motion.div>

                {/* Classes Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <WrapperCard>
                        <div className="bg-[#fff] rounded-xl h-[600px] overflow-hidden flex flex-col">
                            <div className="px-6 py-4 bg-[#f5e8dc] border-b border-[#e7c6a5]">
                                <h2 className="text-xl font-semibold text-[#4a3a2c] flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Class Management
                                </h2>
                                <p className="text-sm text-[#9b8778]">Overview of all scheduled classes</p>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <ClassesTable newClassLogs={newClassLogs} onUpdate={onUpdate} />
                            </div>
                        </div>
                    </WrapperCard>
                </motion.div>
            </div>
        </div>
    );
};

export default InstituteInfo;
