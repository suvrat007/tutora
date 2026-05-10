import { useState, useEffect } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { Loader2 } from "lucide-react";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ParentSchedulePage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

    useEffect(() => {
        axiosInstance.get("parent/schedule")
            .then(res => setData(res.data))
            .catch(() => setError("Failed to load schedule"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#8b5e3c] animate-spin" />
        </div>
    );

    if (error) return <p className="text-center py-10 text-sm text-red-500">{error}</p>;

    const subjects = data?.subjects || [];

    if (subjects.length === 0) return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h2 className="text-lg font-bold text-[#2c1a0e] mb-1">Schedule</h2>
            <p className="text-sm text-[#9b8778]">No schedule found. The student may not be enrolled in a batch yet.</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="mb-5">
                <h2 className="text-lg font-bold text-[#2c1a0e]">Weekly Schedule</h2>
                {data.batchName && <p className="text-sm text-[#9b8778] mt-0.5">Batch: {data.batchName}</p>}
            </div>

            {/* Weekly grid */}
            <div className="bg-white rounded-2xl border border-[#e8d5c0] overflow-hidden shadow-sm mb-6">
                <div className="grid grid-cols-8 border-b border-[#e8d5c0]">
                    <div className="p-3 text-xs font-semibold text-[#9b8778] border-r border-[#e8d5c0]">Subject</div>
                    {DAYS.map((day, i) => (
                        <div
                            key={day}
                            className={`p-3 text-center text-xs font-semibold ${
                                day === todayName ? "bg-[#f5ede3] text-[#7b5c4b]" : "text-[#9b8778]"
                            }`}
                        >
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{DAY_SHORT[i]}</span>
                        </div>
                    ))}
                </div>
                {subjects.map((subj, idx) => (
                    <div
                        key={subj.subjectId}
                        className={`grid grid-cols-8 ${idx < subjects.length - 1 ? "border-b border-[#f0e4d5]" : ""}`}
                    >
                        <div className="p-3 text-xs font-medium text-[#2c1a0e] border-r border-[#e8d5c0] flex items-center">
                            {subj.subjectName}
                        </div>
                        {DAYS.map(day => {
                            const hasClass = subj.days.includes(day);
                            return (
                                <div
                                    key={day}
                                    className={`p-2 text-center text-xs flex items-center justify-center ${
                                        day === todayName ? "bg-[#fdf7f2]" : ""
                                    }`}
                                >
                                    {hasClass ? (
                                        <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#2c1a0e] text-white text-[10px] font-medium whitespace-nowrap">
                                            {subj.time}
                                        </span>
                                    ) : (
                                        <span className="text-[#e8d5c0]">—</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Subject cards with start dates */}
            <div className="space-y-2">
                {subjects.map(subj => (
                    <div key={subj.subjectId} className="bg-white border border-[#e8d5c0] rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#2c1a0e]">{subj.subjectName}</p>
                            <p className="text-xs text-[#9b8778] mt-0.5">
                                {subj.days.join(', ')} · {subj.time}
                            </p>
                        </div>
                        {subj.startDate && (
                            <span className="text-xs text-[#b0998a]">
                                since {new Date(subj.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParentSchedulePage;
