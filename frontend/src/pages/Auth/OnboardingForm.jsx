import { useState } from "react";
import axiosInstance from "@/utilities/axiosInstance";
import { useNavigate } from "react-router-dom";
import useFetchUser from "@/pages/useFetchUser.js"; // Assuming this hook is correctly implemented
import { motion } from "framer-motion"; // Import motion for animations
import { Card, CardContent } from "@/components/ui/card"; // Assuming these are styled components
import { Input } from "@/components/ui/input"; // Assuming this is a styled input component
import { Button } from "@/components/ui/button"; // Assuming this is a styled button component

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

    // Ensure these environment variables are correctly loaded in your Vite setup
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
            if (!cloudName || !uploadPreset) {
                throw new Error("Cloudinary configuration missing (cloudName or uploadPreset).");
            }
            const url = await uploadToCloudinary(file, cloudName, uploadPreset);
            setFormData({ ...formData, logo_URL: url });
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            setError("Failed to upload logo. Please check your Cloudinary configuration and try again.");
            setFormData({ ...formData, logo_URL: "" });
            setLocalPreview(null);
        } finally {
            setUploading(false);
            // Revoke the object URL to free up memory
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
        <div className="relative min-h-screen bg-[#F0EAD6] flex items-center justify-center px-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-md w-full"
            >
                <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border border-[#DEDCCA] text-[#4A442A]">
                    <CardContent className="p-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#3A3322] mb-6">
                            Institute Onboarding
                        </h2>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="instiName" className="block text-sm font-medium text-[#7F745B]">Institute Name</label>
                                <Input
                                    id="instiName"
                                    type="text"
                                    name="instiName"
                                    placeholder="e.g., Green Valley School"
                                    value={formData.instiName}
                                    onChange={handleChange}
                                    required
                                    className="bg-[#F8F6EF] border-[#DEDCCA] placeholder-[#9B9078] text-[#4A442A] focus:ring-[#A08860] focus:border-[#A08860]"
                                />
                            </div>

                            <div>
                                <label htmlFor="logoUpload" className="block mb-1 text-sm font-medium text-[#7F745B]">Upload Institute Logo (Optional)</label>
                                <input
                                    id="logoUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="w-full text-[#4A442A] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#EDE9D7] file:text-[#5A543A] hover:file:bg-[#E0DBCE] transition duration-150 ease-in-out"
                                />
                                {uploading && <p className="text-sm text-[#8F7C5A] mt-2">Uploading logo, please wait...</p>}
                                {(localPreview || formData.logo_URL) && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={localPreview || formData.logo_URL}
                                            alt="Institute Logo Preview"
                                            className="h-28 w-28 object-contain border border-[#DEDCCA] rounded-md shadow-sm p-1 bg-white"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="instituteEmailId" className="block text-sm font-medium text-[#7F745B]">Institute Contact Email</label>
                                <Input
                                    id="instituteEmailId"
                                    type="email"
                                    name="instituteEmailId"
                                    placeholder="e.g., contact@institute.com"
                                    value={formData.instituteEmailId}
                                    onChange={handleChange}
                                    required
                                    className="bg-[#F8F6EF] border-[#DEDCCA] placeholder-[#9B9078] text-[#4A442A] focus:ring-[#A08860] focus:border-[#A08860]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#7F745B]">Institute Contact Phone</label>
                                <Input
                                    id="phoneNumber"
                                    type="text"
                                    name="phone_number"
                                    placeholder="e.g., +1234567890"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    className="bg-[#F8F6EF] border-[#DEDCCA] placeholder-[#9B9078] text-[#4A442A] focus:ring-[#A08860] focus:border-[#A08860]"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#A08860] text-white py-2.5 rounded-md hover:bg-[#8F7C5A] focus:outline-none focus:ring-2 focus:ring-[#A08860] focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-lg"
                                disabled={uploading}
                            >
                                {uploading ? "Uploading Logo..." : "Submit Onboarding"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default OnboardingForm;