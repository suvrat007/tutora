import { useState } from "react";
import axiosInstance from "@/utilities/axiosInstance";
import { useNavigate } from "react-router-dom";
import useFetchUser from "@/pages/useFetchUser.js";
import { X } from "lucide-react";
import { motion } from "framer-motion";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1";

const uploadToCloudinary = async (file, cloudName, uploadPreset) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed");
    }
    return data.secure_url;
};

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
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const fetchUser = useFetchUser();

    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

    // Animation variants
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    };

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

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
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
        setError(null);

        try {
            const url = await uploadToCloudinary(file, cloudName, uploadPreset);
            if (type === "adminPic") {
                setFormData(prev => ({ ...prev, adminPicURL: url }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    institute_info: {
                        ...prev.institute_info,
                        logo_URL: url,
                    },
                }));
            }
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            setError("Failed to upload image. Please try again.");

            // Reset on error
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
        setError(null);
        setIsSubmitting(true);

        // Client-side validation
        if (!formData.name.trim()) {
            setError("Admin name is required");
            setIsSubmitting(false);
            return;
        }

        if (!formData.emailId.trim()) {
            setError("Admin email is required");
            setIsSubmitting(false);
            return;
        }

        if (!formData.institute_info.name.trim()) {
            setError("Institute name is required");
            setIsSubmitting(false);
            return;
        }

        if (!formData.institute_info.contact_info.emailId.trim()) {
            setError("Institute contact email is required");
            setIsSubmitting(false);
            return;
        }

        if (!formData.institute_info.contact_info.phone_number.trim()) {
            setError("Institute contact phone is required");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axiosInstance.patch("/api/admin/update", {
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

            console.log("Update successful:", response.data);
            await fetchUser();
            onClose();
        } catch (err) {
            console.error("Update error:", err);
            const errorMessage = err.response?.data?.message || "An unexpected error occurred during update.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="relative bg-[#f8ede3] rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 p-6 space-y-5 border border-[#e6c8a8]"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[#5a4a3c] hover:text-[#e0c4a8] focus:outline-none"
                    disabled={isSubmitting}
                >
                    <X className="w-5 h-5"/>
                </motion.button>

                <h2 className="text-3xl font-extrabold text-center text-[#5a4a3c] mb-6">
                    Edit Institute Details
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Admin Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#5a4a3c] border-b border-[#e6c8a8] pb-2">Admin Details</h3>

                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-medium text-[#7b5c4b]">
                                    Admin Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="e.g., John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#e6c8a8] rounded-lg focus:ring-[#e0c4a8] focus:border-[#e0c4a8] transition duration-150 ease-in-out bg-[#f0d9c0] text-[#5a4a3c] disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="emailId" className="block text-sm font-medium text-[#7b5c4b]">
                                    Admin Email *
                                </label>
                                <input
                                    id="emailId"
                                    type="email"
                                    name="emailId"
                                    placeholder="e.g., admin@institute.com"
                                    value={formData.emailId}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#e6c8a8] rounded-lg focus:ring-[#e0c4a8] focus:border-[#e0c4a8] transition duration-150 ease-in-out bg-[#f0d9c0] text-[#5a4a3c] disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="adminPicUpload" className="block text-sm font-medium text-[#7b5c4b]">
                                    Upload Admin Picture (Optional)
                                </label>
                                <input
                                    id="adminPicUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "adminPic")}
                                    disabled={isSubmitting || uploadingAdminPic}
                                    className="w-full text-[#5a4a3c] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#e0c4a8] file:text-[#5a4a3c] hover:file:bg-[#d7b48f] transition duration-150 ease-in-out disabled:opacity-50"
                                />
                                {uploadingAdminPic && (
                                    <p className="text-sm text-[#5a4a3c] mt-2">Uploading admin picture, please wait...</p>
                                )}
                                {(localAdminPicPreview || formData.adminPicURL) && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={localAdminPicPreview || formData.adminPicURL}
                                            alt="Admin Picture Preview"
                                            className="h-28 w-28 object-cover border border-[#e6c8a8] rounded-lg shadow-sm p-1 bg-[#f0d9c0]"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Institute Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#5a4a3c] border-b border-[#e6c8a8] pb-2">Institute Details</h3>

                            <div className="space-y-2">
                                <label htmlFor="institute_info.name" className="block text-sm font-medium text-[#7b5c4b]">
                                    Institute Name *
                                </label>
                                <input
                                    id="institute_info.name"
                                    type="text"
                                    name="institute_info.name"
                                    placeholder="e.g., Green Valley School"
                                    value={formData.institute_info.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#e6c8a8] rounded-lg focus:ring-[#e0c4a8] focus:border-[#e0c4a8] transition duration-150 ease-in-out bg-[#f0d9c0] text-[#5a4a3c] disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="logoUpload" className="block text-sm font-medium text-[#7b5c4b]">
                                    Upload Institute Logo (Optional)
                                </label>
                                <input
                                    id="logoUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "logo")}
                                    disabled={isSubmitting || uploadingLogo}
                                    className="w-full text-[#5a4a3c] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#e0c4a8] file:text-[#5a4a3c] hover:file:bg-[#d7b48f] transition duration-150 ease-in-out disabled:opacity-50"
                                />
                                {uploadingLogo && (
                                    <p className="text-sm text-[#5a4a3c] mt-2">Uploading logo, please wait...</p>
                                )}
                                {(localLogoPreview || formData.institute_info.logo_URL) && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={localLogoPreview || formData.institute_info.logo_URL}
                                            alt="Institute Logo Preview"
                                            className="h-28 w-28 object-cover border border-[#e6c8a8] rounded-lg shadow-sm p-1 bg-[#f0d9c0]"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="institute_info.contact_info.emailId" className="block text-sm font-medium text-[#7b5c4b]">
                                    Institute Contact Email *
                                </label>
                                <input
                                    id="institute_info.contact_info.emailId"
                                    type="email"
                                    name="institute_info.contact_info.emailId"
                                    placeholder="e.g., contact@institute.com"
                                    value={formData.institute_info.contact_info.emailId}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#e6c8a8] rounded-lg focus:ring-[#e0c4a8] focus:border-[#e0c4a8] transition duration-150 ease-in-out bg-[#f0d9c0] text-[#5a4a3c] disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="institute_info.contact_info.phone_number" className="block text-sm font-medium text-[#7b5c4b]">
                                    Institute Contact Phone *
                                </label>
                                <input
                                    id="institute_info.contact_info.phone_number"
                                    type="tel"
                                    name="institute_info.contact_info.phone_number"
                                    placeholder="e.g., +1234567890"
                                    value={formData.institute_info.contact_info.phone_number}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2 border border-[#e6c8a8] rounded-lg focus:ring-[#e0c4a8] focus:border-[#e0c4a8] transition duration-150 ease-in-out bg-[#f0d9c0] text-[#5a4a3c] disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <motion.button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={uploadingAdminPic || uploadingLogo || isSubmitting}
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-[#e0c4a8] text-[#5a4a3c] py-2.5 rounded-lg hover:bg-[#d7b48f] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : uploadingAdminPic || uploadingLogo ? "Uploading..." : "Save Changes"}
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-[#e6c8a8] text-[#5a4a3c] py-2.5 rounded-lg hover:bg-[#d7b48f] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EditInfoModal;