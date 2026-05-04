import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const BAR_MAX_PX = 140;

const getWeekStart = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    date.setDate(d + mondayOffset);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${mm}-${dd}`;
};

const weekLabel = (weekStart) => {
    const [y, m, d] = weekStart.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
        month: "short", day: "numeric",
    });
};

const ClassFrequencyTrend = () => {
    const classLogs = useSelector(s => s.classlogs);

    const weeks = useMemo(() => {
        const counts = {};
        for (const log of classLogs) {
            for (const cls of log.classes || []) {
                if (cls.updated && cls.hasHeld && cls.date) {
                    const w = getWeekStart(cls.date);
                    counts[w] = (counts[w] || 0) + 1;
                }
            }
        }

        const today = new Date();
        const seen = new Set();
        const result = [];
        for (let i = 7; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i * 7);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const ws = getWeekStart(`${y}-${m}-${day}`);
            if (!seen.has(ws)) {
                seen.add(ws);
                result.push({ ws, count: counts[ws] || 0 });
            }
        }
        return result;
    }, [classLogs]);

    const maxCount = Math.max(...weeks.map(w => w.count), 1);
    const totalHeld = weeks.reduce((sum, w) => sum + w.count, 0);

    return (
        <div className="bg-[#f8ede3] rounded-3xl border border-[#e6c8a8] shadow-xl p-4 sm:p-6 sm:h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e6c8a8] pb-2.5 mb-4">
                <h2 className="text-lg font-semibold text-[#5a4a3c] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#c47d3e]" />
                    Weekly Class Activity
                </h2>
                {totalHeld > 0 && (
                    <span className="text-xs text-[#b0998a] font-medium">{totalHeld} classes · 8 wks</span>
                )}
            </div>

            {totalHeld === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#7b5c4b]">
                    <BarChart3 className="w-9 h-9 text-[#e0c4a8]" />
                    <p className="text-sm font-medium">No class activity recorded yet.</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-end">
                    {/* Bars */}
                    <div
                        className="flex items-end gap-1 sm:gap-1.5"
                        style={{ height: BAR_MAX_PX }}
                    >
                        {weeks.map((w, i) => {
                            const barH = w.count > 0
                                ? Math.max(Math.round((w.count / maxCount) * BAR_MAX_PX), 6)
                                : 0;
                            return (
                                <div
                                    key={w.ws}
                                    className="flex-1 flex flex-col items-center justify-end gap-0.5"
                                >
                                    <span className="text-[9px] sm:text-[10px] font-semibold text-[#7b5c4b] leading-none">
                                        {w.count > 0 ? w.count : ""}
                                    </span>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: barH }}
                                        transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.06 }}
                                        className="w-full rounded-t-md"
                                        style={{
                                            background: w.count > 0
                                                ? "linear-gradient(180deg, #c47d3e 0%, #8b5e3c 100%)"
                                                : "#e6c8a8",
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* X-axis labels */}
                    <div className="flex gap-1 sm:gap-1.5 mt-2 border-t border-[#e6c8a8] pt-1.5">
                        {weeks.map(w => (
                            <div key={w.ws} className="flex-1 text-center">
                                <span className="text-[7px] sm:text-[8px] text-[#b0998a] font-medium leading-none">
                                    {weekLabel(w.ws)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassFrequencyTrend;
