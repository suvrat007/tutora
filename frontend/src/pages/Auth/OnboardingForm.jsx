import { useState } from "react";
import axiosInstance from "@/utilities/axiosInstance";
import { useNavigate } from "react-router-dom";
import useFetchUser from "@/pages/useFetchUser.js";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

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

        try {
            if (!cloudName || !uploadPreset) {
                throw new Error("Cloudinary configuration missing.");
            }
            const url = await uploadToCloudinary(file, cloudName, uploadPreset);
            setFormData({ ...formData, logo_URL: url });
            toast.success("Logo uploaded successfully!");
        } catch (err) {
            toast.error(err.message || "Failed to upload logo.");
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

        if (!adminCreds || !adminCreds.name || !adminCreds.emailId || !adminCreds.password) {
            toast.error("Admin credentials are missing.");
            return;
        }

        try {
            const response = await axiosInstance.post("/api/auth/signup", {
                admin: adminCreds,
                ...formData,
            }, { withCredentials: true });

            toast.success("Onboarding successful!");
            await fetchUser();
            navigate("/main");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
            toast.error(errorMessage);
        }
    };

    if (signupCreds) return <OnboardingForm adminCreds={signupCreds} />;

    return (
        <div className="relative min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="relative z-10 max-w-md w-full"
            >
                <Card className="rounded-2xl shadow-medium bg-white/90 backdrop-blur-sm border border-border text-text">
                    <CardContent className="p-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-6">
                            Institute Onboarding
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="instiName" className="block text-sm font-medium text-text-light">Institute Name</label>
                                <Input
                                    id="instiName"
                                    type="text"
                                    name="instiName"
                                    placeholder="e.g., Green Valley School"
                                    value={formData.instiName}
                                    onChange={handleChange}
                                    required
                                    className="bg-background border-border placeholder-text-light text-text"
                                />
                            </div>

                            <div>
                                <label htmlFor="logoUpload" className="block mb-1 text-sm font-medium text-text-light">Upload Institute Logo (Optional)</label>
                                <input
                                    id="logoUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, "logo")}
                                    className="w-full text-text file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent-light file:text-text hover:file:bg-accent transition duration-150 ease-in-out"
                                />
                                {uploading && <p className="text-sm text-primary mt-2">Uploading logo...</p>}
                                {(localPreview || formData.logo_URL) && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={localPreview || formData.logo_URL}
                                            alt="Institute Logo Preview"
                                            className="h-28 w-28 object-contain border border-border rounded-md shadow-sm p-1 bg-white"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="instituteEmailId" className="block text-sm font-medium text-text-light">Institute Contact Email</label>
                                <Input
                                    id="instituteEmailId"
                                    type="email"
                                    name="instituteEmailId"
                                    placeholder="e.g., contact@institute.com"
                                    value={formData.instituteEmailId}
                                    onChange={handleChange}
                                    required
                                    className="bg-background border-border placeholder-text-light text-text"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-light">Institute Contact Phone</label>
                                <Input
                                    id="phoneNumber"
                                    type="text"
                                    name="phone_number"
                                    placeholder="e.g., +1234567890"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    className="bg-background border-border placeholder-text-light text-text"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary text-white py-2.5 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out font-semibold text-lg"
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