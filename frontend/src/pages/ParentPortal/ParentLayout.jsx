import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { LayoutDashboard, CalendarCheck, Wallet, BookOpen, Clock, LogOut, Download, Upload } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { clearParentUser } from "@/utilities/redux/parentUserSlice.js";
import { useInstallPWA } from "@/hooks/useInstallPWA.js";

const navItems = [
    { to: "/parent",            label: "Dashboard",  icon: LayoutDashboard, end: true },
    { to: "/parent/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/parent/fees",       label: "Fees",       icon: Wallet },
    { to: "/parent/tests",      label: "Tests",      icon: BookOpen },
    { to: "/parent/schedule",   label: "Schedule",   icon: Clock },
];

const ParentLayout = () => {
    const parentUser = useSelector((state) => state.parentUser);
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const { canInstall, install, showIOSHint } = useInstallPWA();
    const [iosHintOpen, setIosHintOpen] = useState(false);

    const handleLogout = async () => {
        try { await axiosInstance.post("parent/logout"); } catch (_) {}
        dispatch(clearParentUser());
        navigate("/parent/login");
    };

    return (
        <div className="min-h-screen bg-[#faf6f1] flex">

            {/* ── Desktop sidebar ── */}
            <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-56 bg-white border-r border-[#e8d5c0] z-40">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-[#e8d5c0]">
                    <span className="text-xl font-extrabold text-[#2c1a0e] tracking-tight">Tutora</span>
                    {parentUser && (
                        <p className="text-[11px] text-[#9b8778] mt-0.5 truncate">
                            {parentUser.relation === 'mom' ? 'Mother' : 'Father'} Portal
                        </p>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-[#2c1a0e] text-white"
                                        : "text-[#7b5c4b] hover:bg-[#f5ede3] hover:text-[#2c1a0e]"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "stroke-white" : "stroke-[#8b5e3c]"}`} />
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User + logout */}
                <div className="px-3 py-4 border-t border-[#e8d5c0]">
                    {parentUser && (
                        <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-[#f5ede3] border border-[#e8d5c0] flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-[#7b5c4b]">
                                    {parentUser.studentName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#2c1a0e] truncate">{parentUser.studentName}</p>
                                <p className="text-[10px] text-[#9b8778] truncate">{parentUser.instituteName}</p>
                            </div>
                        </div>
                    )}
                    {canInstall && (
                        <button
                            onClick={install}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#7b5c4b] hover:bg-[#f5ede3] hover:text-[#2c1a0e] transition-colors cursor-pointer mb-1"
                        >
                            <Download className="w-4 h-4 shrink-0 stroke-[#8b5e3c]" />
                            Install App
                        </button>
                    )}
                    {showIOSHint && (
                        <div className="mb-1 mx-1 flex items-start gap-2 rounded-xl border border-[#e8d5c0] bg-[#faf6f1] px-3 py-2.5">
                            <Download className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#8b5e3c]" />
                            <p className="text-[10px] text-[#7b5c4b] leading-snug">
                                Tap <span className="inline-flex items-center gap-0.5 font-semibold">Share <Upload className="w-2.5 h-2.5" /></span> in Safari, then <span className="font-semibold">"Add to Home Screen"</span>
                            </p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#7b5c4b] hover:bg-[#f5ede3] hover:text-[#2c1a0e] transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 shrink-0 stroke-[#8b5e3c]" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Main area ── */}
            <div className="flex-1 flex flex-col md:ml-56">

                {/* Mobile top bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-[#e8d5c0] md:hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-[#2c1a0e] tracking-tight">Tutora</span>
                        <div className="flex items-center gap-1">
                            {canInstall && (
                                <button
                                    onClick={install}
                                    className="flex items-center text-[#7b5c4b] hover:text-[#2c1a0e] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#f5ede3] cursor-pointer"
                                    title="Add to Home Screen"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                            )}
                            {showIOSHint && (
                                <button
                                    onClick={() => setIosHintOpen(v => !v)}
                                    className="flex items-center text-[#7b5c4b] hover:text-[#2c1a0e] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#f5ede3] cursor-pointer"
                                    title="How to install"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-xs text-[#7b5c4b] hover:text-[#2c1a0e] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#f5ede3] cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                    {showIOSHint && iosHintOpen && (
                        <div className="border-t border-[#e8d5c0] bg-[#faf6f1] px-4 py-2.5 flex items-start gap-2.5">
                            <Upload className="w-4 h-4 mt-0.5 shrink-0 text-[#8b5e3c]" />
                            <p className="text-xs text-[#7b5c4b] leading-relaxed">
                                Tap <span className="font-semibold text-[#5a4a3c]">Share <Upload className="inline w-3 h-3" /></span> at the bottom of Safari, then <span className="font-semibold text-[#5a4a3c]">"Add to Home Screen"</span>.
                            </p>
                        </div>
                    )}
                </header>

                {/* Desktop top bar */}
                <header className="hidden md:flex sticky top-0 z-20 bg-white border-b border-[#e8d5c0] px-6 py-3 items-center justify-between">
                    <div>
                        <p className="text-xs text-[#9b8778]">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    {parentUser && (
                        <div className="flex items-center gap-2.5">
                            <div className="text-right">
                                <p className="text-xs font-semibold text-[#2c1a0e]">{parentUser.studentName}</p>
                                <p className="text-[10px] text-[#9b8778]">{parentUser.relation === 'mom' ? 'Mother' : 'Father'}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5e3c] to-[#2c1a0e] flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                    {parentUser.studentName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    )}
                </header>

                <main className="flex-1 pb-20 md:pb-6">
                    <Outlet />
                </main>

                {/* Mobile bottom nav */}
                <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#e8d5c0] md:hidden">
                    <div className="flex items-stretch">
                        {navItems.map(({ to, label, icon: Icon, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors ${
                                        isActive ? "text-[#2c1a0e]" : "text-[#b0998a]"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon className={`w-5 h-5 ${isActive ? "stroke-[#2c1a0e]" : "stroke-[#b0998a]"}`} />
                                        {label}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default ParentLayout;
