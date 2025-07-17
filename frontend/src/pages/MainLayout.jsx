// MainLayout.jsx
import React, { useState } from "react";
import SideBar from "@/pages/Navbar/SideBar.jsx";
import Navbar from "@/pages/Navbar/Navbar.jsx";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen w-screen bg-[#d3a781] text-text flex justify-center items-start overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="bg-[#fee5cf] relative w-full h-[95vh] rounded-2xl border-border shadow-medium overflow-hidden flex mx-2 my-4"
            >
                {/* Desktop Sidebar */}
                <div className="hidden lg:block ">
                    <SideBar />
                </div>

                {/* Mobile Hamburger button */}
                <button
                    className="absolute top-4 left-4 z-50 lg:hidden p-2 rounded-lg hover:bg-[#f4e3d0] transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu size={24} className="text-[#4a3a2c]" />
                </button>

                {/* Mobile Sidebar Modal */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        />

                        {/* Mobile Sidebar */}
                        <motion.div
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="relative w-80 max-w-[85vw] h-full bg-[#e7c6a5] shadow-2xl"
                        >
                            <SideBar
                                isMobile={true}
                                onClose={() => setIsSidebarOpen(false)}
                            />
                        </motion.div>
                    </div>
                )}

                <div className="flex flex-col w-full overflow-hidden">
                    <Navbar />
                    <main className="flex-grow p-6 overflow-y-auto lg:ml-0">
                        <Outlet />
                    </main>
                </div>
            </motion.div>
        </div>
    );
};

export default MainLayout;