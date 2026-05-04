import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, GraduationCap, AlertCircle } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL ?? '') + '/api/v1';
const pub = axios.create({ baseURL: API_BASE });

const EMPTY_FORM = {
    name: '', address: '', grade: '', school_name: '',
    contact_info: {
        emailIds: { student: '', mom: '', dad: '' },
        phoneNumbers: { student: '', mom: '', dad: '' },
    },
    fee_amount: '',
};

const inputCls = (err) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm text-[#2c1a0e] placeholder-[#b0998a] bg-white focus:outline-none focus:ring-2 focus:ring-[#c47d3e]/30 transition-colors ${
        err ? 'border-red-400 bg-red-50' : 'border-[#e6c8a8]'
    }`;

const SECTIONS = (form) => [
    {
        title: 'General Info',
        fields: [
            { label: 'Full Name', key: 'name', type: 'text', value: form.name, required: true },
            { label: 'Grade / Class', key: 'grade', type: 'number', value: form.grade, required: true },
            { label: 'School Name', key: 'school_name', type: 'text', value: form.school_name, required: true },
            { label: 'Home Address', key: 'address', type: 'text', value: form.address, required: true },
        ],
    },
    {
        title: "Student's Contact",
        fields: [
            { label: 'Student Email', key: 'email_student', type: 'email', value: form.contact_info.emailIds.student, required: true },
            { label: 'Student Phone', key: 'phone_student', type: 'tel', value: form.contact_info.phoneNumbers.student, required: true },
        ],
    },
    {
        title: "Parent's Contact",
        fields: [
            { label: "Father's Email", key: 'email_dad', type: 'email', value: form.contact_info.emailIds.dad, required: true },
            { label: "Father's Phone", key: 'phone_dad', type: 'tel', value: form.contact_info.phoneNumbers.dad, required: true },
            { label: "Mother's Email", key: 'email_mom', type: 'email', value: form.contact_info.emailIds.mom, required: true },
            { label: "Mother's Phone", key: 'phone_mom', type: 'tel', value: form.contact_info.phoneNumbers.mom, required: true },
        ],
    },
    {
        title: 'Fee Details',
        fields: [
            { label: 'Monthly Fee Amount (₹)', key: 'fee_amount', type: 'number', value: form.fee_amount, required: false },
        ],
    },
];

const StudentOnboardingPage = () => {
    const { adminId } = useParams();
    const [institute, setInstitute] = useState(null);
    const [loadingInstitute, setLoadingInstitute] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        pub.get(`/register/${adminId}/info`)
            .then(r => setInstitute(r.data.data))
            .catch(() => setNotFound(true))
            .finally(() => setLoadingInstitute(false));
    }, [adminId]);

    const setField = (key, value) => {
        setErrors(e => { const n = { ...e }; delete n[key]; return n; });
        if (key === 'fee_amount') {
            setForm(f => ({ ...f, fee_amount: value }));
        } else if (key.startsWith('email_') || key.startsWith('phone_')) {
            const [type, field] = key.split('_');
            const group = type === 'email' ? 'emailIds' : 'phoneNumbers';
            setForm(f => ({
                ...f,
                contact_info: {
                    ...f.contact_info,
                    [group]: { ...f.contact_info[group], [field]: value },
                },
            }));
        } else {
            setForm(f => ({ ...f, [key]: value }));
        }
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Required';
        if (!String(form.grade).trim()) e.grade = 'Required';
        if (!form.address.trim()) e.address = 'Required';
        if (!form.school_name.trim()) e.school_name = 'Required';
        if (!form.contact_info.emailIds.student.trim()) e.email_student = 'Required';
        if (!form.contact_info.phoneNumbers.student.trim()) e.phone_student = 'Required';
        if (!form.contact_info.emailIds.dad.trim()) e.email_dad = 'Required';
        if (!form.contact_info.phoneNumbers.dad.trim()) e.phone_dad = 'Required';
        if (!form.contact_info.emailIds.mom.trim()) e.email_mom = 'Required';
        if (!form.contact_info.phoneNumbers.mom.trim()) e.phone_mom = 'Required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate() || submitting) return;
        setSubmitting(true);
        try {
            await pub.post(`/register/${adminId}`, {
                ...form,
                grade: Number(form.grade),
                fee_amount: Number(form.fee_amount) || 0,
            });
            setSubmitted(true);
        } catch (err) {
            setErrors(e => ({ ...e, submit: err.response?.data?.message || 'Submission failed. Please try again.' }));
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingInstitute) {
        return (
            <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#c47d3e] animate-spin" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-[#b0998a] mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#2c1a0e] mb-2">Invalid Registration Link</h1>
                    <p className="text-[#7b5c4b]">This link may be invalid or expired. Please contact your institute for a new link.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="text-center max-w-sm"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#2c1a0e] mb-2">Registration Submitted!</h1>
                    <p className="text-[#7b5c4b] mb-1">
                        Your details have been sent to <strong>{institute?.instiName}</strong>.
                    </p>
                    <p className="text-sm text-[#b0998a]">
                        The institute will review your application and reach out to you soon.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf6f1] py-10 px-4">
            {/* Background decoration */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#e7c6a5]/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-[#f5d9bc]/15 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-2xl mx-auto">
                {/* Institute header */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-8"
                >
                    {institute?.logo_URL ? (
                        <img
                            src={institute.logo_URL}
                            alt="Institute logo"
                            className="h-16 w-16 object-contain mx-auto mb-3 rounded-2xl border border-[#e6c8a8] shadow-sm"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-[#f0d9c0] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#e6c8a8]">
                            <GraduationCap className="w-8 h-8 text-[#c47d3e]" />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-[#2c1a0e]">{institute?.instiName}</h1>
                    <p className="text-sm text-[#9b8778] mt-1">Student Registration Form</p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-[#f8ede3] rounded-3xl border border-[#e6c8a8] shadow-xl overflow-hidden"
                >
                    <div className="bg-[#f0d9c0] border-b border-[#e6c8a8] px-6 py-4">
                        <h2 className="text-base font-semibold text-[#5a4a3c]">Fill in your details below</h2>
                        <p className="text-xs text-[#9b8778] mt-0.5">All fields marked * are required</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <AnimatePresence>
                            {SECTIONS(form).map((section, si) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: si * 0.07 }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-5 h-5 rounded-full bg-[#e6c8a8] text-[#5a4a3c] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                            {si + 1}
                                        </span>
                                        <h3 className="text-xs font-semibold text-[#5a4a3c] uppercase tracking-wider">{section.title}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
                                        {section.fields.map(({ label, key, type, value, required }) => (
                                            <div key={key}>
                                                <label className="block text-xs font-medium text-[#7b5c4b] mb-1">
                                                    {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                                                </label>
                                                <input
                                                    type={type}
                                                    placeholder={label}
                                                    value={value}
                                                    onChange={e => setField(key, e.target.value)}
                                                    className={inputCls(errors[key])}
                                                />
                                                {errors[key] && (
                                                    <p className="text-red-500 text-[11px] mt-0.5">{errors[key]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {errors.submit && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {errors.submit}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-xl bg-[#2c1a0e] text-white font-semibold text-sm hover:bg-[#3e2510] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                        >
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                            ) : (
                                'Submit Registration'
                            )}
                        </button>
                    </form>
                </motion.div>

                <p className="text-center text-xs text-[#b0998a] mt-6">
                    Your information will be reviewed by <strong>{institute?.instiName}</strong> before being added to their system.
                </p>
            </div>
        </div>
    );
};

export default StudentOnboardingPage;
