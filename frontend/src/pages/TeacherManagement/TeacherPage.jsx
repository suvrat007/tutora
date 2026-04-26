import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BookOpen } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { setTeachers, addTeacher, updateTeacher, removeTeacher } from "@/utilities/redux/teacherSlice.js";
import WrapperCard from "@/components/ui/WrapperCard.jsx";
import ConfirmationModal from "@/components/ui/ConfirmationModal.jsx";
import toast from "react-hot-toast";

const emptyForm = {
    name: "", qualification: "", emailId: "", phoneNumber: "",
    subjects: [],       // [{ batch_id, subject_id }]
    teaching_batches: [],
};

const TeacherPage = () => {
    const dispatch = useDispatch();
    const teachers = useSelector(state => state.teachers.teachers);
    const batches = useSelector(state => state.batches);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Subject picker state
    const [pickerBatch, setPickerBatch] = useState("");
    const [pickerSubject, setPickerSubject] = useState("");

    useEffect(() => {
        axiosInstance.get('teacher/all')
            .then(res => dispatch(setTeachers(res.data.data)))
            .catch(() => toast.error("Failed to load teachers"));
    }, [dispatch]);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const getBatchName = (batchId) =>
        batches.find(b => b._id === batchId?.toString())?.name || "Unknown Batch";

    const getSubjectName = (batchId, subjectId) => {
        const batch = batches.find(b => b._id === batchId?.toString());
        return batch?.subject?.find(s => s._id === subjectId?.toString())?.name || "Unknown Subject";
    };

    const pickerBatchObj = batches.find(b => b._id === pickerBatch);
    const pickerSubjects = pickerBatchObj?.subject || [];

    // ── Subject combo helpers ──────────────────────────────────────────────────

    const isDuplicate = (batchId, subjectId) =>
        form.subjects.some(s => s.batch_id === batchId && s.subject_id === subjectId);

    const addSubjectCombo = () => {
        if (!pickerBatch || !pickerSubject) return;
        if (isDuplicate(pickerBatch, pickerSubject)) {
            toast.error("This subject from this batch is already added");
            return;
        }
        setForm(prev => ({
            ...prev,
            subjects: [...prev.subjects, { batch_id: pickerBatch, subject_id: pickerSubject }],
        }));
        setPickerSubject("");
    };

    const addAllSubjectsFromBatch = () => {
        if (!pickerBatch || pickerSubjects.length === 0) return;
        const newCombos = pickerSubjects
            .filter(s => !isDuplicate(pickerBatch, s._id))
            .map(s => ({ batch_id: pickerBatch, subject_id: s._id }));
        if (newCombos.length === 0) {
            toast.error("All subjects from this batch are already added");
            return;
        }
        setForm(prev => ({ ...prev, subjects: [...prev.subjects, ...newCombos] }));
        setPickerSubject("");
    };

    const removeSubjectCombo = (batchId, subjectId) => {
        setForm(prev => ({
            ...prev,
            subjects: prev.subjects.filter(s => !(s.batch_id === batchId && s.subject_id === subjectId)),
        }));
    };

    // ── Batch toggle ───────────────────────────────────────────────────────────

    const handleBatchToggle = (batchId) => {
        setForm(prev => ({
            ...prev,
            teaching_batches: prev.teaching_batches.includes(batchId)
                ? prev.teaching_batches.filter(id => id !== batchId)
                : [...prev.teaching_batches, batchId],
        }));
    };

    // ── Open / close ───────────────────────────────────────────────────────────

    const resetPicker = () => { setPickerBatch(""); setPickerSubject(""); };

    const openAdd = () => { setEditing(null); setForm(emptyForm); resetPicker(); setShowForm(true); };

    const openEdit = (t) => {
        setEditing(t);
        setForm({
            name: t.name,
            qualification: t.qualification,
            emailId: t.contact_info.emailId,
            phoneNumber: t.contact_info.phoneNumber,
            // subjects come back as [{ batch_id: ObjectId|string, subject_id: ObjectId|string }]
            subjects: (t.subjects || []).map(s => ({
                batch_id: s.batch_id?.toString?.() ?? s.batch_id,
                subject_id: s.subject_id?.toString?.() ?? s.subject_id,
            })),
            teaching_batches: t.teaching_batches.map(tb => tb.batch_id?._id || tb.batch_id),
        });
        resetPicker();
        setShowForm(true);
    };

    const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); resetPicker(); };

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                qualification: form.qualification,
                emailId: form.emailId,
                phoneNumber: form.phoneNumber,
                subjects: form.subjects,
                teaching_batches: form.teaching_batches.map(id => ({ batch_id: id })),
            };
            if (editing) {
                const res = await axiosInstance.put(`teacher/update/${editing._id}`, payload);
                dispatch(updateTeacher(res.data));
                toast.success("Teacher updated");
            } else {
                const res = await axiosInstance.post('teacher/add', payload);
                dispatch(addTeacher(res.data));
                toast.success("Teacher added");
            }
            closeForm();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save teacher");
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axiosInstance.delete(`teacher/delete/${deleteId}`);
            dispatch(removeTeacher(deleteId));
            toast.success("Teacher deleted");
        } catch {
            toast.error("Failed to delete teacher");
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    // Group teacher's subjects by batch for compact card display
    const groupSubjectsByBatch = (subjects = []) => {
        const map = {};
        subjects.forEach(({ batch_id, subject_id }) => {
            const bid = batch_id?.toString?.() ?? batch_id;
            if (!map[bid]) map[bid] = [];
            map[bid].push(subject_id?.toString?.() ?? subject_id);
        });
        return map;
    };

    return (
        <>
            <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
                <WrapperCard>
                    <div className="bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden">
                        <div className="flex items-center justify-between p-4 sm:p-6 bg-[#f0d9c0] border-b border-[#e6c8a8]">
                            <h2 className="text-xl font-bold text-[#5a4a3c] flex items-center gap-2">
                                <FaChalkboardTeacher className="text-[#8b5e3c]" /> Teachers
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={openAdd}
                                className="flex items-center gap-2 bg-[#e0c4a8] text-[#5a4a3c] px-4 py-2 rounded-lg hover:bg-[#d8bca0] transition-all font-medium shadow-sm"
                            >
                                <FiPlus /> Add Teacher
                            </motion.button>
                        </div>

                        {teachers.length === 0 ? (
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="flex flex-col items-center justify-center py-16 text-[#7b5c4b] cursor-pointer"
                                onClick={openAdd}
                            >
                                <FaChalkboardTeacher className="text-5xl text-[#e0c4a8] mb-3" />
                                <p className="text-sm">No teachers yet. Click to add one.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                                <AnimatePresence>
                                    {teachers.map((t, i) => {
                                        const subjectGroups = groupSubjectsByBatch(t.subjects);
                                        return (
                                            <motion.div
                                                key={t._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="bg-white border border-[#e6c8a8] rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e0c4a8] to-[#d0b498] flex items-center justify-center text-white font-bold text-lg">
                                                        {t.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => openEdit(t)} className="p-1.5 text-[#8b5e3c] hover:bg-[#f0d9c0] rounded-md transition-colors">
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteId(t._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition-colors">
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h3 className="font-semibold text-[#5a4a3c] text-sm">{t.name}</h3>
                                                <p className="text-xs text-[#7b5c4b] mb-2">{t.qualification}</p>
                                                <p className="text-xs text-[#7b5c4b]">{t.contact_info.phoneNumber}</p>
                                                <p className="text-xs text-[#7b5c4b] truncate mb-2">{t.contact_info.emailId}</p>

                                                {/* Subjects grouped by batch */}
                                                {Object.keys(subjectGroups).length > 0 && (
                                                    <div className="mt-1 space-y-1.5">
                                                        <p className="text-[10px] font-semibold text-[#7b5c4b] flex items-center gap-1">
                                                            <BookOpen className="w-3 h-3" /> Subjects
                                                        </p>
                                                        {Object.entries(subjectGroups).map(([bId, sIds]) => (
                                                            <div key={bId}>
                                                                <p className="text-[10px] text-[#8b5e3c] font-medium mb-0.5">
                                                                    {getBatchName(bId)}
                                                                </p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {sIds.map(sId => (
                                                                        <span key={sId} className="text-[10px] bg-[#e0c4a8] text-[#5a4a3c] px-2 py-0.5 rounded-full">
                                                                            {getSubjectName(bId, sId)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Teaching batches */}
                                                {t.teaching_batches.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {t.teaching_batches.map(tb => (
                                                            <span key={tb._id} className="text-xs bg-[#f0d9c0] text-[#8b5e3c] px-2 py-0.5 rounded-full">
                                                                {tb.batch_id?.name || "Batch"}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </WrapperCard>
            </div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                        onClick={closeForm}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#f8ede3] rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-[#5a4a3c]">
                                    {editing ? "Edit Teacher" : "Add Teacher"}
                                </h3>
                                <button onClick={closeForm} className="text-[#7b5c4b] hover:text-[#5a4a3c]">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                {/* Basic fields */}
                                {[
                                    { field: "name", label: "Name", type: "text" },
                                    { field: "qualification", label: "Qualification", type: "text" },
                                    { field: "emailId", label: "Email", type: "email" },
                                    { field: "phoneNumber", label: "Phone", type: "tel" },
                                ].map(({ field, label, type }) => (
                                    <div key={field}>
                                        <label className="block text-xs font-medium text-[#5a4a3c] mb-1">{label}</label>
                                        <input
                                            type={type}
                                            value={form[field]}
                                            onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                                            required
                                            className="w-full border border-[#e6c8a8] bg-white rounded-lg px-3 py-2 text-sm text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8]"
                                        />
                                    </div>
                                ))}

                                {/* Subject picker */}
                                {batches.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-medium text-[#5a4a3c] mb-1">
                                            Subjects <span className="text-[#9b7b6b] font-normal">(pick batch → subject)</span>
                                        </label>

                                        {/* Dropdowns row */}
                                        <div className="flex gap-2 mb-2">
                                            <select
                                                value={pickerBatch}
                                                onChange={e => { setPickerBatch(e.target.value); setPickerSubject(""); }}
                                                className="flex-1 border border-[#e6c8a8] bg-white rounded-lg px-2 py-2 text-xs text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8]"
                                            >
                                                <option value="">Select Batch</option>
                                                {batches.map(b => (
                                                    <option key={b._id} value={b._id}>{b.name}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={pickerSubject}
                                                onChange={e => setPickerSubject(e.target.value)}
                                                disabled={!pickerBatch || pickerSubjects.length === 0}
                                                className="flex-1 border border-[#e6c8a8] bg-white rounded-lg px-2 py-2 text-xs text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">
                                                    {!pickerBatch
                                                        ? "— select batch first —"
                                                        : pickerSubjects.length === 0
                                                            ? "No subjects in batch"
                                                            : "Select Subject"}
                                                </option>
                                                {pickerSubjects.map(s => (
                                                    <option key={s._id} value={s._id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2 mb-2">
                                            <button
                                                type="button"
                                                onClick={addSubjectCombo}
                                                disabled={!pickerBatch || !pickerSubject}
                                                className="flex-1 px-3 py-1.5 bg-[#e0c4a8] text-[#5a4a3c] rounded-lg text-xs font-medium hover:bg-[#d8bca0] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                + Add Subject
                                            </button>
                                            <button
                                                type="button"
                                                onClick={addAllSubjectsFromBatch}
                                                disabled={!pickerBatch || pickerSubjects.length === 0}
                                                className="flex-1 px-3 py-1.5 bg-[#f0d9c0] text-[#5a4a3c] rounded-lg text-xs font-medium hover:bg-[#e8cfb3] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                + All from Batch
                                            </button>
                                        </div>

                                        {/* Added subject chips */}
                                        {form.subjects.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-lg border border-[#e6c8a8] max-h-28 overflow-y-auto">
                                                {form.subjects.map(({ batch_id, subject_id }) => (
                                                    <span
                                                        key={`${batch_id}-${subject_id}`}
                                                        className="flex items-center gap-1 text-[10px] bg-[#e0c4a8] text-[#5a4a3c] pl-2 pr-1 py-0.5 rounded-full"
                                                    >
                                                        <span className="font-medium">{getBatchName(batch_id)}</span>
                                                        <span className="text-[#8b5e3c]">›</span>
                                                        <span>{getSubjectName(batch_id, subject_id)}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubjectCombo(batch_id, subject_id)}
                                                            className="ml-0.5 hover:text-red-500 transition-colors"
                                                        >
                                                            <FiX className="w-2.5 h-2.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {form.subjects.length === 0 && (
                                            <p className="text-[10px] text-[#9b7b6b] italic">No subjects added yet</p>
                                        )}
                                    </div>
                                )}

                                {/* Teaching batches */}
                                {batches.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-medium text-[#5a4a3c] mb-1">
                                            Assign to Batches
                                            <span className="text-[#9b7b6b] font-normal ml-1">(overall batch access)</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                                            {batches.map(b => (
                                                <button
                                                    key={b._id}
                                                    type="button"
                                                    onClick={() => handleBatchToggle(b._id)}
                                                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                                                        form.teaching_batches.includes(b._id)
                                                            ? "bg-[#8b5e3c] text-white border-[#8b5e3c]"
                                                            : "bg-white text-[#5a4a3c] border-[#e6c8a8] hover:bg-[#f0d9c0]"
                                                    }`}
                                                >
                                                    {b.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={saving}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="mt-1 bg-[#8b5e3c] text-white py-2 rounded-lg font-medium hover:bg-[#7a4f2f] transition-all disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : editing ? "Update Teacher" : "Add Teacher"}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {deleteId && (
                <ConfirmationModal
                    message="Delete this teacher? This cannot be undone."
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                    isLoading={deleting}
                />
            )}
        </>
    );
};

export default TeacherPage;
