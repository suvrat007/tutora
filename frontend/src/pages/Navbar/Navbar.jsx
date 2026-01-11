import { useSelector } from "react-redux";
import {useNavigate} from "react-router-dom";

const Navbar = () => {
    const adminData = useSelector((state) => state.user);
    const navigate = useNavigate();
    return (
        <header className="bg-[#e7c6a5] min-h-20 mx-4 mt-4 mb-2 rounded-3xl shadow-md px-6  flex items-center justify-between font-['Outfit',sans-serif]">

            <div className="flex items-center cursor-pointer" onClick={()=> navigate('/')}>
                {adminData?.institute_info?.logo_URL ? (
                    <div className="relative">
                        <img
                            src={adminData.institute_info.logo_URL}
                            alt="Institute Logo"
                            className="w-16  h-16 rounded-full border border-gray-400 shadow-sm p-1"
                        />
                    </div>
                ) : (
                    <div
                        className="bg-[#e7c6a5] mx-4 px-6 py-3 rounded-2xl shadow-md flex justify-between items-center text-[#4a3a2c]">
                        <div className="flex items-center gap-4">
                            <div
                                className="bg-[#4a3a2c] text-white w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm">
                                Tutora
                            </div>
                        </div>
                    </div>
                )}


            </div>

            <div className="flex flex-col text-center cursor-pointer items-center justify-between" onClick={()=> navigate('/main')}>
                <h1 className="text-xl sm:text-2xl font-semibold text-[#4a3a2c] leading-tight">
                    {adminData?.institute_info?.name || "Tutora"}
                </h1>
                <span className="text-sm text-[#6b4c3b]">Tutor Dashboard</span>
            </div>

            <div className="flex items-center gap-4 cursor-pointer" onClick={()=> navigate('/main/info-institute')}>
                <span className="h-6 w-px bg-[#d4a97f]"/>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={adminData.adminPicURL}
                            alt="User Avatar"
                            className="w-12 h-12 rounded-full border border-gray-400 shadow-sm p-1 bg-[#f4e3d0]"
                        />
                        <span
                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#e7c6a5]"/>
                    </div>
                    <div className="hidden sm:block leading-tight">
                        <div className="text-sm font-medium text-[#4a3a2c]">{adminData.name}</div>
                        <div className="text-sm font-medium text-[#4a3a2c]">Tutor</div>
                    </div>
                </div>


            </div>
        </header>
    );
};

export default Navbar;