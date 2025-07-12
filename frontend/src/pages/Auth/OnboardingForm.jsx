import { useState } from "react";
import axiosInstance from "@/utilities/axiosInstance";
import { useNavigate } from "react-router-dom";
import useFetchUser from "@/pages/useFetchUser.js"; // Assuming this hook is correctly implemented

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

const OnboardingForm = ({ adminCreds }) => {
    const [formData, setFormData] = useState({
        instiName: "",
        logo_URL: "",
        instituteEmailId: "",
        phone_number: "",
    });

    const [uploading, setUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewURL = URL.createObjectURL(file);
        setLocalPreview(previewURL);
        setUploading(true);
        setError(null);

        try {
            const url = await uploadToCloudinary(file, cloudName, uploadPreset);
            setFormData({ ...formData, logo_URL: url });
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            setError("Failed to upload logo. Please try again.");
            setFormData({ ...formData, logo_URL: "" });
            setLocalPreview(null);
        } finally {
            setUploading(false);
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        }
    };

    const fetchUser = useFetchUser();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!adminCreds || !adminCreds.name || !adminCreds.emailId || !adminCreds.password) {
            setError("Admin credentials are missing. Cannot proceed with onboarding.");
            return;
        }

        try {
            const response = await axiosInstance.post("/api/auth/signup", {
                admin: adminCreds,
                ...formData,
            }, { withCredentials: true });

            console.log("Signup successful:", response.data);
            await fetchUser();
            navigate("/main");
        } catch (err) {
            console.error("Signup error:", err);
            const errorMessage = err.response?.data?.message || "An unexpected error occurred during signup.";
            setError(errorMessage);
        }
    };

    return (
        <div className="flex justify-center items-center px-4 min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-xl w-full max-w-md space-y-5 border border-green-200">
                <h2 className="text-3xl font-extrabold text-center text-green-700 mb-6">Institute Onboarding</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="space-y-3">
                    <label htmlFor="instiName" className="block text-sm font-medium text-gray-700">Institute Name</label>
                    <input
                        id="instiName"
                        type="text"
                        name="instiName"
                        placeholder="e.g., Green Valley School"
                        value={formData.instiName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                    />
                </div>

                <div>
                    <label htmlFor="logoUpload" className="block mb-1 text-sm font-medium text-gray-700">Upload Institute Logo (Optional)</label>
                    <input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition duration-150 ease-in-out"
                    />
                    {uploading && <p className="text-sm text-blue-600 mt-2">Uploading logo, please wait...</p>}
                    {(localPreview || formData.logo_URL) && (
                        <div className="mt-4 flex justify-center">
                            <img
                                src={localPreview || formData.logo_URL}
                                alt="Institute Logo Preview"
                                className="h-28 w-28 object-contain border border-gray-300 rounded-md shadow-sm p-1 bg-white"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <label htmlFor="instituteEmailId" className="block text-sm font-medium text-gray-700">Institute Contact Email</label>
                    <input
                        id="instituteEmailId"
                        type="email"
                        name="instituteEmailId"
                        placeholder="e.g., contact@institute.com"
                        value={formData.instituteEmailId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                    />
                </div>

                <div className="space-y-3">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Institute Contact Phone</label>
                    <input
                        id="phoneNumber"
                        type="text"
                        name="phone_number"
                        placeholder="e.g., +1234567890"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-lg"
                    disabled={uploading} // Disable button while uploading
                >
                    {uploading ? "Uploading Logo..." : "Submit Onboarding"}
                </button>
            </form>
        </div>
    );
};

export default OnboardingForm;