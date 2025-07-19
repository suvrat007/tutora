import { useState } from "react";
import axiosInstance from "@/utilities/axiosInstance";
import { useNavigate } from "react-router-dom";
import useFetchUser from "@/pages/useFetchUser.js";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <div className="relative min-h-screen bg-gradient-to-br from-[#fdf5ec] to-[#f5e8dc] flex items-center justify-center px-4 sm:px-6 md:px-8 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl"
            >
                <Card className="rounded-2xl shadow-xl bg-[#f8ede3]/90 backdrop-blur-sm border border-[#e7c6a5]/50">
                    <CardContent className="p-6 sm:p-8">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#4a3a2c] mb-6">
                            Institute Onboarding
                        </h2>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="instiName" className="block text-sm sm:text-base font-medium text-[#9b8778]">Institute Name</label>
                                <Input
                                    id="instiName"
                                    type="text"
                                    name="instiName"
                                    placeholder="e.g., Green Valley School"
                                    value={formData.instiName}
                                    onChange={handleChange}
                                    required
                                    className="bg-[#f8ede3] border-[#e7c6a5] placeholder-[#9b8778] text-[#4a3a2c] focus:ring-[#e7c6a5] focus:border-[#e7c6a5]"
                                />
                            </div>

                            <div>
                                <label htmlFor="logoUpload" className="block mb-1 text-sm sm:text-base font-medium text-[#9b8778]">Upload Institute Logo (Optional)</label>
                                <input
                                    id="logoUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="w-full text-[#4a3a2c] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm sm:file:text-base file:font-semibold file:bg-[#f8ede3] file:text-[#4a3a2c] hover:file:bg-[#e7c6a5]/20 transition duration-150 ease-in-out"
                                />
                                {uploading && <p className="text-sm sm:text-base text-[#4a3a2c] mt-2">Uploading logo, please wait...</p>}
                                {(localPreview || formData.logo_URL) && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={localPreview || formData.logo_URL}
                                            alt="Institute Logo Preview"
                                            className="h-20 sm:h-24 md:h-28 w-20 sm:w-24 md:w-28 object-contain border border-[#e7c6a5]/50 rounded-md shadow-sm p-1 bg-[#f8ede3]"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="instituteEmailId" className="block text-sm sm:text-base font-medium text-[#9b8778]">Institute Contact Email</label>
                                <Input
                                    id="instituteEmailId"
                                    type="email"
                                    name="instituteEmailId"
                                    placeholder="e.g., contact@institute.com"
                                    value={formData.instituteEmailId}
                                    onChange={handleChange}
                                    required
                                    className="bg-[#f8ede3] border-[#e7c6a5] placeholder-[#9b8778] text-[#4a3a2c] focus:ring-[#e7c6a5] focus:border-[#e7c6a5]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phoneNumber" className="block text-sm sm:text-base font-medium text-[#9b8778]">Institute Contact Phone</label>
                                <Input
                                    id="phoneNumber"
                                    type="text"
                                    name="phone_number"
                                    placeholder="e.g., +1234567890"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    className="bg-[#f8ede3] border-[#e7c6a5] placeholder-[#9b8778] text-[#4a3a2c] focus:ring-[#e7c6a5] focus:border-[#e7c6a5]"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#4a3a2c] text-white py-2.5 rounded-md hover:bg-[#3e2f23] focus:outline-none focus:ring-2 focus:ring-[#e7c6a5] focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-base sm:text-lg"
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