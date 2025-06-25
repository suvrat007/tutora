import { useState } from "react"
import axiosInstance from "@/utilities/axiosInstance"
import { useNavigate } from "react-router-dom"
import useFetchUser from "@/pages/useFetchUser.js";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1"

const uploadToCloudinary = async (file, cloudName, uploadPreset) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)

    const res = await fetch(`${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
    })

    const data = await res.json()
    return data.secure_url
}

const OnboardingForm = ({ adminCreds }) => {
    const [formData, setFormData] = useState({
        name: "",
        logo_URL: "",
        emailId: "",
        phone_number: "",
    })

    const [uploading, setUploading] = useState(false)
    const [localPreview, setLocalPreview] = useState(null)
    const navigate = useNavigate()

    const cloudName = import.meta.env.VITE_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const previewURL = URL.createObjectURL(file)
        setLocalPreview(previewURL)

        setUploading(true)
        try {
            const url = await uploadToCloudinary(file, cloudName, uploadPreset)
            setFormData({ ...formData, logo_URL: url })
        } catch (err) {
            console.error("Upload failed:", err)
        } finally {
            setUploading(false)
            URL.revokeObjectURL(previewURL)
        }
    }

    const fetchUser = useFetchUser()
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axiosInstance.post("/api/auth/signup", {
                admin: adminCreds,
                ...formData,
            }, { withCredentials: true })

            console.log("User signed up:", response.data)
            await fetchUser()
            navigate("/main")
        } catch (err) {
            console.error("Signup error:", err)
        }
    }

    return (
        <div className="flex justify-center items-center px-4">
            <form onSubmit={handleSubmit} className="p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
                <h2 className="text-2xl font-bold text-center text-green-700">Onboarding Form</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Institute Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md"
                />

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Upload Logo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full px-4 py-2 border rounded-md"
                    />
                    {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
                    {(localPreview || formData.logo_URL) && (
                        <div className="mt-4 flex justify-center">
                            <img
                                src={localPreview || formData.logo_URL}
                                alt="Logo Preview"
                                className="h-24 w-24 object-contain border rounded-md shadow"
                            />
                        </div>
                    )}
                </div>

                <input
                    type="email"
                    name="emailId"
                    placeholder="Contact Email"
                    value={formData.emailId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md"
                />

                <input
                    type="text"
                    name="phone_number"
                    placeholder="Contact Phone Number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md"
                />

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                >
                    Submit
                </button>
            </form>
        </div>
    )
}

export default OnboardingForm
