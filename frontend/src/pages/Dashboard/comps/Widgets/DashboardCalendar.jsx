import { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar as CalendarIcon, X, Plus } from "lucide-react";
import { getDay, getDaysInMonth } from "date-fns";
import {
    CalendarProvider,
    CalendarDatePagination,
    CalendarDatePicker,
    CalendarMonthPicker,
    CalendarYearPicker,
    CalendarHeader,
    useCalendarMonth,
    useCalendarYear,
} from "@/components/kibo-ui/calendar";
import { cn } from "@/lib/utils";
import axiosInstance from "@/utilities/axiosInstance";
import ReminderModal from "@/pages/Dashboard/comps/P1/ReminderModal";

const DayPopover = ({ day, month, year, reminders, onDelete, onClose, onAddReminder }) => {
    const date = new Date(year, month, day);
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const label = date.toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
    });

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.15 }}
                className="bg-[#f8ede3] border border-[#e6c8a8] rounded-2xl shadow-2xl p-4 w-[90%] max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-[#5a4a3c]">{label}</p>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-[#b0998a] hover:text-[#5a4a3c] hover:bg-[#e6c8a8] transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mb-3">
                    {reminders.length === 0 ? (
                        <p className="text-xs text-[#b0998a] text-center py-2">No reminders for this day.</p>
                    ) : reminders.map((rem) => (
                        <div
                            key={rem._id}
                            className="flex items-start gap-2 bg-white border border-[#e6c8a8] rounded-xl px-3 py-2"
                        >
                            <p className="flex-1 text-sm text-[#5a4a3c] break-words leading-snug">
                                {rem.reminder}
                                {rem.batchName && (
                                    <span className="block text-[10px] text-[#b0998a] mt-0.5">{rem.batchName}</span>
                                )}
                            </p>
                            <button
                                onClick={() => onDelete(rem._id)}
                                className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[#b0998a] hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>

                {!isPast && (
                    <button
                        onClick={() => { onClose(); onAddReminder(date); }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#8b5e3c] text-white text-sm font-medium hover:bg-[#7a4f2f] transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Reminder
                    </button>
                )}
            </motion.div>
        </div>
    );
};

const ReminderCalendarBody = ({ reminders, onDayClick, onDelete, onShowAll }) => {
    const [month] = useCalendarMonth();
    const [year] = useCalendarYear();

    const today = new Date();
    const daysInMonth = getDaysInMonth(new Date(year, month, 1));
    const firstDayOfWeek = getDay(new Date(year, month, 1));
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const remindersByDay = useMemo(() => {
        const map = {};
        for (const rem of reminders) {
            const d = new Date(rem.reminderDate);
            if (d.getMonth() === month && d.getFullYear() === year) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push(rem);
            }
        }
        return map;
    }, [reminders, month, year]);

    const cells = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
        cells.push(<div key={`pre-${i}`} className="min-h-[5rem] border-r border-b border-[#e6c8a8]/60" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const rems = remindersByDay[day] || [];
        const date = new Date(year, month, day);
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const isPast = date < todayMidnight;
        const visible = rems.slice(0, 2);
        const overflow = rems.length - 2;

        const handleCellClick = () => {
            if (rems.length > 0) onShowAll(day, month, year, rems);
            else if (!isPast) onDayClick(date);
        };

        cells.push(
            <div
                key={day}
                onClick={handleCellClick}
                className={cn(
                    "flex flex-col items-start p-1 sm:p-1.5 text-xs font-medium min-h-[5rem] w-full overflow-hidden border-r border-b border-[#e6c8a8]/60",
                    isToday ? "bg-[#c47d3e]/10" : "",
                    (rems.length > 0 || !isPast) ? "cursor-pointer hover:bg-[#e6c8a8]/40" : "cursor-default"
                )}
            >
                {/* Day number */}
                <span className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full mb-1 font-semibold shrink-0 text-[11px] sm:text-xs",
                    isToday ? "bg-[#c47d3e] text-white" : isPast ? "text-[#c4b0a4]" : "text-[#5a4a3c]"
                )}>
                    {day}
                </span>

                {/* Mobile: dots only */}
                {rems.length > 0 && (
                    <div className="flex sm:hidden flex-wrap gap-0.5 px-0.5">
                        {rems.slice(0, 3).map((_, i) => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: isPast ? "#c4b0a4" : "#8b5e3c" }} />
                        ))}
                        {rems.length > 3 && (
                            <span className="text-[8px] text-[#8b5e3c] font-bold leading-none">+{rems.length - 3}</span>
                        )}
                    </div>
                )}

                {/* Desktop: full tags with X */}
                <div className="hidden sm:flex flex-col gap-0.5 w-full">
                    {visible.map((rem) => (
                        <div key={rem._id} className="flex items-center gap-0.5 rounded px-1 py-0.5 w-full"
                            style={{ background: isPast ? "#8b5e3c11" : "#8b5e3c22" }}>
                            <span className="flex-1 truncate text-[10px] leading-tight font-medium"
                                style={{ color: isPast ? "#a08060" : "#5a3a1a" }}>
                                {rem.reminder}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(rem._id); }}
                                className="shrink-0 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[#b0998a] hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    ))}
                    {overflow > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onShowAll(day, month, year, rems); }}
                            className="text-[9px] font-semibold text-[#8b5e3c] hover:text-[#5a3a1a] text-left pl-1 mt-0.5 underline underline-offset-2"
                        >
                            +{overflow} more
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-7 mt-1 border-l border-t border-[#e6c8a8]/60">
            {cells}
        </div>
    );
};

const DashboardCalendar = ({ onReminderAdded, refreshKey = 0 }) => {
    const [reminders, setReminders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [popover, setPopover] = useState(null);

    const fetchReminders = useCallback(() => {
        axiosInstance
            .get("reminder/get-reminder", { withCredentials: true })
            .then((res) => setReminders(res.data.reminder || []))
            .catch((err) => console.error("DashboardCalendar:", err.message));
    }, []);

    useEffect(() => { fetchReminders(); }, [refreshKey, fetchReminders]);

    const handleDayClick = useCallback((date) => {
        setSelectedDate(date);
        setShowModal(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        fetchReminders();
        onReminderAdded?.();
    }, [onReminderAdded, fetchReminders]);

    const handleDelete = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`reminder/delete-reminder/${id}`, { withCredentials: true });
            fetchReminders();
            onReminderAdded?.();
            setPopover((prev) =>
                prev ? { ...prev, rems: prev.rems.filter((r) => r._id !== id) } : null
            );
        } catch (err) {
            console.error("Delete reminder:", err.message);
        }
    }, [fetchReminders, onReminderAdded]);

    const handleShowAll = useCallback((day, month, year, rems) => {
        setPopover({ day, month, year, rems });
    }, []);

    useEffect(() => {
        if (!popover) return;
        const updated = reminders.filter((r) => {
            const d = new Date(r.reminderDate);
            return d.getDate() === popover.day && d.getMonth() === popover.month && d.getFullYear() === popover.year;
        });
        setPopover((prev) => prev ? { ...prev, rems: updated } : null);
    }, [reminders]);

    return (
        <div className="bg-[#f8ede3] rounded-3xl border border-[#e6c8a8] shadow-xl p-4 sm:p-6">
            <CalendarProvider>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-[#e6c8a8] pb-3">
                    <h2 className="text-lg font-semibold text-[#5a4a3c] flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-[#c47d3e]" />
                        Reminders Calendar
                        <span className="text-xs font-normal text-[#b0998a] hidden sm:inline">— click a date to view or add</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <CalendarDatePicker>
                            <CalendarMonthPicker />
                            <CalendarYearPicker start={2024} end={2028} />
                        </CalendarDatePicker>
                        <CalendarDatePagination />
                    </div>
                </div>
                <CalendarHeader className="flex-none border-l border-t border-[#e6c8a8]/60 [&>div]:border-r [&>div]:border-b [&>div]:border-[#e6c8a8]/60" />
                <ReminderCalendarBody
                    reminders={reminders}
                    onDayClick={handleDayClick}
                    onDelete={handleDelete}
                    onShowAll={handleShowAll}
                />
            </CalendarProvider>

            <AnimatePresence>
                {showModal && (
                    <ReminderModal setShowModal={handleModalClose} value={selectedDate} />
                )}
                {popover && (
                    <DayPopover
                        key="popover"
                        day={popover.day}
                        month={popover.month}
                        year={popover.year}
                        reminders={popover.rems}
                        onDelete={handleDelete}
                        onClose={() => setPopover(null)}
                        onAddReminder={handleDayClick}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardCalendar;
