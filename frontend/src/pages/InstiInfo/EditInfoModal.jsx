import { useState } from "react";
import axiosInstance from "@/utilities/axiosInstance";
import { useNavigate } from "react-router-dom";
import useFetchUser from "@/pages/useFetchUser.js";
import { X } from "lucide-react";

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
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 p-6 space-y-5 border border-green-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isSubmitting}
                >
                    <X className="w-5 h-5"/>
                </button>

                <h2 className="text-3xl font-extrabold text-center text-green-700 mb-6">
                    Edit Institute Details
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Admin Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Admin Details</h3>

                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="emailId" className="block text-sm font-medium text-gray-700">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="adminPicUpload" className="block text-sm font-medium text-gray-700">
                                    Upload Admin Picture (Optional)
                                </label>
                                <input
                                    id="adminPicUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "adminPic")}
                                    disabled={isSubmitting || uploadingAdminPic}
                                    className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition duration-150 ease-in-out disabled:opacity-50"
                                />
                                {uploadingAdminPic && (
                                    <p className="text-sm text-blue-600 mt-2">Uploading admin picture, please wait...</p>
                                )}
                                {(localAdminPicPreview || formData.adminPicURL) && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={localAdminPicPreview || formData.adminPicURL}
                                            alt="Admin Picture Preview"
                                            className="h-28 w-28 object-cover border border-gray-300 rounded-md shadow-sm p-1 bg-white"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Institute Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Institute Details</h3>

                            <div className="space-y-2">
                                <label htmlFor="institute_info.name" className="block text-sm font-medium text-gray-700">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700">
                                    Upload Institute Logo (Optional)
                                </label>
                                <input
                                    id="logoUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "logo")}
                                    disabled={isSubmitting || uploadingLogo}
                                    className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition duration-150 ease-in-out disabled:opacity-50"
                                />
                                {uploadingLogo && (
                                    <p className="text-sm text-blue-600 mt-2">Uploading logo, please wait...</p>
                                )}
                                {(localLogoPreview || formData.institute_info.logo_URL) && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={localLogoPreview || formData.institute_info.logo_URL}
                                            alt="Institute Logo Preview"
                                            className="h-28 w-28 object-cover border border-gray-300 rounded-md shadow-sm p-1 bg-white"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="institute_info.contact_info.emailId" className="block text-sm font-medium text-gray-700">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="institute_info.contact_info.phone_number" className="block text-sm font-medium text-gray-700">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={uploadingAdminPic || uploadingLogo || isSubmitting}
                            className="flex-1 bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : uploadingAdminPic || uploadingLogo ? "Uploading..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditInfoModal;