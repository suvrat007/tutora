import useLogoutAdmin from "@/useLogoutAdmin.js";
import { useEffect, useState } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";

const Navbar = () => {
    const handleLogout = useLogoutAdmin();
    const [institution, setInstitution] = useState(null);

    useEffect(() => {
        const getInstituteInfo = async () => {
            try {
                const response = await axiosInstance.get(`/api/institute/get`, {
                    withCredentials: true
                });
                if (response?.data) {
                    setInstitution(response.data.data || response.data); // Handle either format
                }
            } catch (error) {
                console.error("Error fetching institute:", error);
            }
        };

        getInstituteInfo();
    }, []);

    return (
        <div className="bg-[#e7c6a5] mx-4 mt-4 mb-2 px-6 py-3 rounded-2xl shadow-md flex justify-between items-center">
            <div className="flex items-center gap-3">
                {institution?.logo_URL ? (
                    <img
                        src={institution.logo_URL}
                        alt="Institute Logo"
                        className="h-10 w-10 object-contain rounded-full border border-gray-300"
                    />
                ): (
                    <span className="text-xl font-semibold text-[#4a3a2c]">LOGO</span>
                )}
            </div>

            <div className="text-base font-medium text-[#4a3a2c]">
                {institution?.name || "Institute Name"}
            </div>

            <div className="flex items-center gap-4">
                <img
                    src="https://www.svgrepo.com/show/527961/user.svg"
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border border-gray-400 shadow-sm"
                />
                <button
                    onClick={handleLogout}
                    className="text-sm bg-[#4a3a2c] text-white px-3 py-1 rounded-md hover:bg-[#3a2f23]"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
