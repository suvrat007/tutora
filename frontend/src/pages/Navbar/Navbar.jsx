import useLogoutAdmin from "@/useLogoutAdmin.js";
import { useEffect } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { BsSearch} from "react-icons/bs";
import { useState } from "react";
import {useSelector} from "react-redux";

const Navbar = () => {
    const handleLogout = useLogoutAdmin();
    const [darkMode, setDarkMode] = useState(false);
    const toggleTheme = () => setDarkMode(!darkMode);

    const adminData = useSelector(state=> state.user)


    return (
        <div className="bg-[#e7c6a5] mx-4 mt-4 mb-2 px-6 py-3 rounded-2xl shadow-md flex justify-between items-center">
            <div className="flex items-center gap-3">
                {adminData?.institute_info?.logo_URL ? (
                    <img
                        src={adminData?.institute_info?.logo_URL}
                        alt="Institute Logo"
                        className="h-10 w-10 object-contain rounded-full border border-gray-300"
                    />
                ) : (
                    <div
                        className="bg-[#e7c6a5] mx-4 mt-4 mb-2 px-6 py-3 rounded-2xl shadow-md flex justify-between items-center text-[#4a3a2c]">
                        <div className="flex items-center gap-4">
                            <div
                                className="bg-[#4a3a2c] text-white w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm">
                                Tutora
                            </div>
                        </div>
                    </div>)}
            </div>

            <div className="text-base font-medium">{adminData?.institute_info?.name}</div>

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
