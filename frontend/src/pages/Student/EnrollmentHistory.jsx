import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance.jsx";

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Present";

const pctColor = (p) =>
    p >= 75 ? "text-green-700 bg-green-50 border-green-200"
    : p >= 50 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-red-700 bg-red-50 border-red-200";

const PctBar = ({ pct }) => (
    <div className="flex items-center gap-2 min-w-0">
        <div className="flex-1 h-1.5 bg-[#f0e4d5] rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                style={{ width: `${pct}%` }}
            />
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${pctColor(pct)}`}>
            {pct}%
        </span>
    </div>
);

const PeriodCard = ({ period }) => {
    const [open, setOpen] = useState(false);
    const hasData = period.subjects?.some(s => s.total > 0) || period.tests?.length > 0;

    return (
        <div className="border border-[#e6c8a8] rounded-2xl overflow-hidden">
            {/* Period header */}
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#faf6f1] hover:bg-[#f5ede3] transition-colors text-left"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${period.isCurrent ? "bg-green-500" : "bg-[#d4b896]"}`} />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2c1a0e] truncate">{period.batchName}</p>
                        <p className="text-[10px] text-[#9b8778]">
                            {fmtDate(period.joinedAt)} — {fmtDate(period.leftAt)}
                            {period.isCurrent && (
                                <span className="ml-2 text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                                    Current
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    {!hasData && (
                        <span className="text-[10px] text-[#b0998a]">No data</span>
                    )}
                    {open
                        ? <ChevronUp className="w-4 h-4 text-[#9b8778]" />
                        : <ChevronDown className="w-4 h-4 text-[#9b8778]" />
                    }
                </div>
            </button>

            {open && (
                <div className="px-4 py-3 space-y-4 bg-white">

                    {/* Attendance */}
                    {period.subjects?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-[#9b8778] uppercase tracking-widest mb-2">
                                Attendance
                            </p>
                            <div className="space-y-2">
                                {period.subjects.map(s => (
                                    <div key={s.subjectId} className="flex items-center gap-3">
                                        <p className="text-xs font-medium text-[#5a4a3c] w-28 shrink-0 truncate">{s.subjectName}</p>
                                        <div className="flex-1 min-w-0">
                                            <PctBar pct={s.percentage} />
                                        </div>
                                        <p className="text-[10px] text-[#9b8778] shrink-0 w-14 text-right">
                                            {s.attended}/{s.total} cls
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tests */}
                    {period.tests?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-[#9b8778] uppercase tracking-widest mb-2">
                                Tests ({period.tests.length})
                            </p>
                            <div className="rounded-xl border border-[#f0e4d5] overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-[#faf6f1] border-b border-[#f0e4d5]">
                                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#9b8778] uppercase tracking-wide">Test</th>
                                            <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#9b8778] uppercase tracking-wide hidden sm:table-cell">Date</th>
                                            <th className="text-center px-3 py-2 text-[10px] font-semibold text-[#9b8778] uppercase tracking-wide">Score</th>
                                            <th className="text-center px-3 py-2 text-[10px] font-semibold text-[#9b8778] uppercase tracking-wide">Result</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f5ede3]">
                                        {period.tests.map((t, i) => (
                                            <tr key={i} className="hover:bg-[#faf6f1] transition-colors">
                                                <td className="px-3 py-2.5">
                                                    <p className="font-medium text-[#2c1a0e] truncate max-w-[120px]">{t.testName}</p>
                                                    {t.subjectName && (
                                                        <p className="text-[10px] text-[#9b8778]">{t.subjectName}</p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 text-[#9b8778] hidden sm:table-cell whitespace-nowrap">
                                                    {fmtDate(t.testDate)}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    {t.appeared
                                                        ? <span className="font-semibold text-[#2c1a0e]">{t.marks}/{t.maxMarks}</span>
                                                        : <span className="text-[#b0998a]">Absent</span>
                                                    }
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    {!t.appeared
                                                        ? <span className="text-[10px] font-semibold text-[#9b8778] bg-[#f5ede3] px-2 py-0.5 rounded-full">—</span>
                                                        : t.passMarks > 0
                                                            ? t.passed
                                                                ? <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Pass</span>
                                                                : <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Fail</span>
                                                            : <span className="text-[10px] font-semibold text-[#7b5c4b] bg-[#f5ede3] px-2 py-0.5 rounded-full">
                                                                {Math.round((t.marks / t.maxMarks) * 100)}%
                                                              </span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!hasData && (
                        <p className="text-xs text-[#b0998a] text-center py-2">No attendance or test data recorded for this period.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const EnrollmentHistory = ({ studentId }) => {
    const [open, setOpen]       = useState(false);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState(null);
    const [error, setError]     = useState(null);

    const load = async () => {
        if (history !== null) { setOpen(true); return; }
        setLoading(true);
        try {
            const res = await axiosInstance.get(`student/enrollment-history/${studentId}`);
            setHistory(res.data.history || []);
            setOpen(true);
        } catch {
            setError("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        if (open) { setOpen(false); return; }
        load();
    };

    return (
        <div className="p-3 sm:p-4 border-t border-[#e6c8a8]">
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between group"
            >
                <h3 className="text-base sm:text-lg font-semibold text-[#5a4a3c]">Batch History</h3>
                <div className="flex items-center gap-1.5 text-xs text-[#9b8778]">
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {!loading && (open
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                    )}
                </div>
            </button>

            {open && (
                <div className="mt-3 space-y-2">
                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}
                    {history?.length === 0 && (
                        <p className="text-xs text-[#9b8778]">No batch history yet.</p>
                    )}
                    {history?.map((period, i) => (
                        <PeriodCard key={`${period.batchId}-${i}`} period={period} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EnrollmentHistory;
