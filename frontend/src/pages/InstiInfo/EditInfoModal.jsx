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
import EditClassModal from "@/pages/InstiInfo/EditClassModal.jsx";

const EditInfoModal = ({ isOpen, onClose, initialData }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        emailId: initialData?.emailId || "",
        adminPicURL: initialData?.adminPicURL || "https://www.svgrepo.com/show/527961/user.svg",
        institute_info: {
            name: initialData?.institute_info?.name || "",
            logo_URL: initialData?.institute_info?.logo_URL || "",
            contact_info: {
                emailId: initialData?.institute_info?.contact_info?.emailId || "",
                phone_number: initialData?.institute_info?.contact_info?.phone_number || "",
            },
        },
    });

    const [uploadingAdminPic, setUploadingAdminPic] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [localAdminPicPreview, setLocalAdminPicPreview] = useState(null);
    const [localLogoPreview, setLocalLogoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const fetchUser = useFetchUser();

    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("institute_info.contact_info.")) {
            const field = name.split(".").pop();
            setFormData(prev => ({
                ...prev,
                institute_info: {
                    ...prev.institute_info,
                    contact_info: {
                        ...prev.institute_info.contact_info,
                        [field]: value,
                    },
                },
            }));
        } else if (name.startsWith("institute_info.")) {
            const field = name.split(".").pop();
            setFormData(prev => ({
                ...prev,
                institute_info: {
                    ...prev.institute_info,
                    [field]: value,
                },
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const previewURL = URL.createObjectURL(file);
        if (type === "adminPic") {
            setLocalAdminPicPreview(previewURL);
            setUploadingAdminPic(true);
        } else {
            setLocalLogoPreview(previewURL);
            setUploadingLogo(true);
        }

        try {
            const url = await uploadToCloudinary(file, cloudName, uploadPreset);
            if (type === "adminPic") {
                setFormData(prev => ({ ...prev, adminPicURL: url }));
                toast.success("Admin picture uploaded!");
            } else {
                setFormData(prev => ({
                    ...prev,
                    institute_info: {
                        ...prev.institute_info,
                        logo_URL: url,
                    },
                }));
                toast.success("Institute logo uploaded!");
            }
        } catch (err) {
            toast.error("Failed to upload image. Please try again.");
            if (type === "adminPic") {
                setFormData(prev => ({
                    ...prev,
                    adminPicURL: initialData?.adminPicURL || "https://www.svgrepo.com/show/527961/user.svg"
                }));
                setLocalAdminPicPreview(null);
            } else {
                setFormData(prev => ({
                    ...prev,
                    institute_info: {
                        ...prev.institute_info,
                        logo_URL: initialData?.institute_info?.logo_URL || "",
                    },
                }));
                setLocalLogoPreview(null);
            }
        } finally {
            if (type === "adminPic") {
                setUploadingAdminPic(false);
            } else {
                setUploadingLogo(false);
            }
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.name.trim()) {
            toast.error("Admin name is required");
            setIsSubmitting(false);
            return;
        }

        if (!formData.emailId.trim()) {
            toast.error("Admin email is required");
            setIsSubmitting(false);
            return;
        }

        if (!formData.institute_info.name.trim()) {
            toast.error("Institute name is required");
            setIsSubmitting(false);
            return;
        }

        if (!formData.institute_info.contact_info.emailId.trim()) {
            toast.error("Institute contact email is required");
            setIsSubmitting(false);
            return;
        }

        if (!formData.institute_info.contact_info.phone_number.trim()) {
            toast.error("Institute contact phone is required");
            setIsSubmitting(false);
            return;
        }

        try {
            await axiosInstance.patch("/api/admin/update", {
                name: formData.name.trim(),
                emailId: formData.emailId.trim(),
                adminPicURL: formData.adminPicURL,
                institute_info: {
                    name: formData.institute_info.name.trim(),
                    logo_URL: formData.institute_info.logo_URL,
                    contact_info: {
                        emailId: formData.institute_info.contact_info.emailId.trim(),
                        phone_number: formData.institute_info.contact_info.phone_number.trim(),
                    },
                },
            }, { withCredentials: true });



            toast.success("Institute information updated successfully!");
            await fetchUser();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "An unexpected error occurred during update.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50"
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative bg-[#f4e3d0] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 p-6 space-y-5 border border-[#ddb892]"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[#6b4c3b] hover:text-[#4a3a2c] focus:outline-none"
                    disabled={isSubmitting}
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-3xl font-extrabold text-center text-[#4a3a2c] mb-6">
                    Edit Institute Details
                </h2>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#4a3a2c] border-b border-[#ddb892] pb-2">Admin Details</h3>

                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-medium text-[#6b4c3b]">
                                    Admin Name *
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="e.g., John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#ddb892] rounded-md bg-[#e7c6a5] text-[#4a3a2c] focus:ring-[#d7b48f] focus:border-[#d7b48f] transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="emailId" className="block text-sm font-medium text-[#6b4c3b]">
                                    Admin Email *
                                </label>
                                <Input
                                    id="emailId"
                                    type="email"
                                    name="emailId"
                                    placeholder="e.g., admin@institute.com"
                                    value={formData.emailId}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#ddb892] rounded-md bg-[#e7c6a5] text-[#4a3a2c] focus:ring-[#d7b48f] focus:border-[#d7b48f] transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="adminPicUpload" className="block text-sm font-medium text-[#6b4c3b]">
                                    Upload Admin Picture (Optional)
                                </label>
                                <input
                                    id="adminPicUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "adminPic")}
                                    disabled={isSubmitting || uploadingAdminPic}
                                    className="w-full text-[#6b4c3b] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#d7b48f] file:text-[#4a3a2c] hover:file:bg-[#d7b48f]/80 transition duration-150 ease-in-out disabled:opacity-50"
                                />
                                {uploadingAdminPic && (
                                    <p className="text-sm text-[#6b4c3b] mt-2">Uploading admin picture, please wait...</p>
                                )}
                                {(localAdminPicPreview || formData.adminPicURL) && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={localAdminPicPreview || formData.adminPicURL}
                                            alt="Admin Picture Preview"
                                            className="h-28 w-28 object-cover border border-[#ddb892] rounded-md shadow-sm p-1 bg-[#e7c6a5]"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#4a3a2c] border-b border-[#ddb892] pb-2">Institute Details</h3>

                            <div className="space-y-2">
                                <label htmlFor="institute_info.name" className="block text-sm font-medium text-[#6b4c3b]">
                                    Institute Name *
                                </label>
                                <Input
                                    id="institute_info.name"
                                    type="text"
                                    name="institute_info.name"
                                    placeholder="e.g., Green Valley School"
                                    value={formData.institute_info.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#ddb892] rounded-md bg-[#e7c6a5] text-[#4a3a2c] focus:ring-[#d7b48f] focus:border-[#d7b48f] transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="logoUpload" className="block text-sm font-medium text-[#6b4c3b]">
                                    Upload Institute Logo (Optional)
                                </label>
                                <input
                                    id="logoUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "logo")}
                                    disabled={isSubmitting || uploadingLogo}
                                    className="w-full text-[#6b4c3b] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#d7b48f] file:text-[#4a3a2c] hover:file:bg-[#d7b48f]/80 transition duration-150 ease-in-out disabled:opacity-50"
                                />
                                {uploadingLogo && (
                                    <p className="text-sm text-[#6b4c3b] mt-2">Uploading logo, please wait...</p>
                                )}
                                {(localLogoPreview || formData.institute_info.logo_URL) && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={localLogoPreview || formData.institute_info.logo_URL}
                                            alt="Institute Logo Preview"
                                            className="h-28 w-28 object-cover border border-[#ddb892] rounded-md shadow-sm p-1 bg-[#e7c6a5]"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="institute_info.contact_info.emailId" className="block text-sm font-medium text-[#6b4c3b]">
                                    Institute Contact Email *
                                </label>
                                <Input
                                    id="institute_info.contact_info.emailId"
                                    type="email"
                                    name="institute_info.contact_info.emailId"
                                    placeholder="e.g., contact@institute.com"
                                    value={formData.institute_info.contact_info.emailId}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#ddb892] rounded-md bg-[#e7c6a5] text-[#4a3a2c] focus:ring-[#d7b48f] focus:border-[#d7b48f] transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="institute_info.contact_info.phone_number" className="block text-sm font-medium text-[#6b4c3b]">
                                    Institute Contact Phone *
                                </label>
                                <Input
                                    id="institute_info.contact_info.phone_number"
                                    type="tel"
                                    name="institute_info.contact_info.phone_number"
                                    placeholder="e.g., +1234567890"
                                    value={formData.institute_info.contact_info.phone_number}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#ddb892] rounded-md bg-[#e7c6a5] text-[#4a3a2c] focus:ring-[#d7b48f] focus:border-[#d7b48f] transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={uploadingAdminPic || uploadingLogo || isSubmitting}
                            className="flex-1 bg-[#d7b48f] text-[#4a3a2c] hover:bg-[#d7b48f]/80 transition-colors duration-200"
                        >
                            {isSubmitting ? "Saving..." : uploadingAdminPic || uploadingLogo ? "Uploading..." : "Save Changes"}
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-[#e7c6a5] text-[#4a3a2c] border border-[#ddb892] hover:bg-[#e7c6a5]/80 transition-colors duration-200"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
export default EditInfoModal