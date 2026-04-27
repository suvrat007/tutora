import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Check, X, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import axiosInstance from '@/utilities/axiosInstance';
import { API } from '@/utilities/constants';
import useFetchStudents from '@/hooks/useFetchStudents';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

const PendingApprovals = () => {
    const [pending, setPending] = useState([]);
    const [expanded, setExpanded] = useState(true);
    const [toDeny, setToDeny] = useState(null);
    const [approvingId, setApprovingId] = useState(null);
    const [denyLoading, setDenyLoading] = useState(false);
    const fetchStudents = useFetchStudents();

    const loadPending = async () => {
        try {
            const res = await axiosInstance.get(API.PENDING_STUDENTS);
            setPending(res.data.data || []);
        } catch {
            // silently fail — not critical
        }
    };

    useEffect(() => { loadPending(); }, []);

    const handleApprove = async (id) => {
        setApprovingId(id);
        try {
            await axiosInstance.post(API.APPROVE_PENDING(id));
            toast.success('Student approved and added to your roster!');
            await Promise.all([fetchStudents(), loadPending()]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Approval failed. Please try again.');
        } finally {
            setApprovingId(null);
        }
    };

    const handleConfirmDeny = async () => {
        if (!toDeny) return;
        setDenyLoading(true);
        try {
            await axiosInstance.delete(API.DENY_PENDING(toDeny));
            toast.success('Registration request denied.');
            await loadPending();
        } catch {
            toast.error('Failed to deny registration.');
        } finally {
            setDenyLoading(false);
            setToDeny(null);
        }
    };

    if (pending.length === 0) return null;

    return (
        <>
            <div className="bg-[#f8ede3] rounded-3xl border border-amber-200 shadow-xl overflow-hidden">
                {/* Header — clickable to expand/collapse */}
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-amber-50 border-b border-amber-200 hover:bg-amber-100 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                        </span>
                        <span className="font-semibold text-[#5a4a3c] text-sm">Pending Registrations</span>
                        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none">
                            {pending.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#9b8778]">
                        <span className="hidden sm:inline">Review &amp; approve student requests</span>
                        {expanded
                            ? <ChevronUp className="w-4 h-4 text-[#7b5c4b]" />
                            : <ChevronDown className="w-4 h-4 text-[#7b5c4b]" />}
                    </div>
                </button>

                {/* List */}
                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.div
                            key="list"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="divide-y divide-[#e6c8a8] max-h-80 overflow-y-auto">
                                {pending.map((p) => (
                                    <motion.div
                                        key={p._id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-3 px-5 py-3"
                                    >
                                        {/* Avatar */}
                                        <div className="w-9 h-9 bg-[#f0d9c0] rounded-full flex items-center justify-center flex-shrink-0 border border-[#e6c8a8]">
                                            <UserPlus className="w-4 h-4 text-[#8b5e3c]" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[#2c1a0e] truncate">{p.name}</p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                                <span className="text-xs text-[#7b5c4b]">Class {p.grade} · {p.school_name}</span>
                                                <span className="flex items-center gap-1 text-[11px] text-[#b0998a]">
                                                    <Phone className="w-2.5 h-2.5" />
                                                    {p.contact_info?.phoneNumbers?.student}
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] text-[#b0998a]">
                                                    <Mail className="w-2.5 h-2.5" />
                                                    {p.contact_info?.emailIds?.student}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[#b0998a] mt-0.5">
                                                Submitted {new Date(p.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleApprove(p._id)}
                                                disabled={approvingId === p._id}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                            >
                                                {approvingId === p._id ? (
                                                    <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Check className="w-3 h-3" />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => setToDeny(p._id)}
                                                disabled={approvingId === p._id}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                <X className="w-3 h-3" /> Deny
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {toDeny && (
                    <ConfirmationModal
                        message="Deny this registration request? The student's submitted data will be permanently deleted and they will need to re-apply."
                        onConfirm={handleConfirmDeny}
                        onCancel={() => setToDeny(null)}
                        isLoading={denyLoading}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default PendingApprovals;
