import SideBar from "@/pages/Navbar/SideBar.jsx";
import Navbar from "@/pages/Navbar/Navbar.jsx";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <div className="h-screen w-screen bg-[#d3a781] text-black flex justify-center items-start overflow-hidden">
            <div className="bg-[#fee5cf] relative w-full h-[95vh] rounded-[2rem] border border-[#e0b890] shadow-2xl overflow-hidden flex flex-col md:flex-row mx-2 mt-4 md:my-4">
                <SideBar />
                <div className="flex flex-col w-full overflow-hidden pb-16 md:pb-0">
                    <Navbar />
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
