import { useState, useEffect } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { Loader2, TrendingUp } from "lucide-react";

const ParentTestsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subjectFilter, setSubjectFilter] = useState("");

    useEffect(() => {
        const url = subjectFilter ? `parent/tests?subjectId=${subjectFilter}` : "parent/tests";
        setLoading(true);
        axiosInstance.get(url)
            .then(res => setData(res.data))
            .catch(() => setError("Failed to load test data"))
            .finally(() => setLoading(false));
    }, [subjectFilter]);

    const tests = data?.tests || [];

    // Get unique subjects for filter dropdown
    const uniqueSubjects = tests.reduce((acc, t) => {
        if (t.subjectId && !acc.find(s => s.id === t.subjectId)) {
            acc.push({ id: t.subjectId, name: t.subjectName });
        }
        return acc;
    }, []);

    // Performance trend data (sorted ascending by date)
    const trendData = [...tests]
        .filter(t => t.appeared && t.maxMarks > 0)
        .sort((a, b) => new Date(a.testDate) - new Date(b.testDate))
        .map(t => ({ pct: Math.round((t.marks / t.maxMarks) * 100), name: t.testName }));

    const avgPct = trendData.length > 0
        ? Math.round(trendData.reduce((s, t) => s + t.pct, 0) / trendData.length)
        : 0;

    // Mini SVG trend line
    const renderTrend = () => {
        if (trendData.length < 2) return null;
        const w = 200, h = 48, pad = 4;
        const xs = trendData.map((_, i) => pad + (i / (trendData.length - 1)) * (w - pad * 2));
        const ys = trendData.map(t => h - pad - ((t.pct / 100) * (h - pad * 2)));
        const points = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
        return (
            <svg width={w} height={h} className="overflow-visible">
                <polyline fill="none" stroke="#8b5e3c" strokeWidth="2" strokeLinejoin="round" points={points} />
                {xs.map((x, i) => (
                    <circle key={i} cx={x} cy={ys[i]} r="3" fill="#8b5e3c" />
                ))}
            </svg>
        );
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#2c1a0e]">Test Results</h2>
                {uniqueSubjects.length > 1 && (
                    <select
                        value={subjectFilter}
                        onChange={e => setSubjectFilter(e.target.value)}
                        className="text-xs border border-[#e8d5c0] rounded-lg px-2 py-1.5 bg-white text-[#5a4a3c] focus:outline-none focus:ring-1 focus:ring-[#c47d3e]/40"
                    >
                        <option value="">All subjects</option>
                        {uniqueSubjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Trend summary card */}
            {trendData.length >= 2 && (
                <div className="bg-white border border-[#e8d5c0] rounded-2xl p-4 mb-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-[#8b5e3c]" />
                        <span className="text-sm font-semibold text-[#2c1a0e]">Performance Trend</span>
                        <span className="ml-auto text-sm font-bold text-[#8b5e3c]">{avgPct}% avg</span>
                    </div>
                    <div className="overflow-x-auto">{renderTrend()}</div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-[#8b5e3c] animate-spin" />
                </div>
            ) : error ? (
                <p className="text-center py-10 text-sm text-red-500">{error}</p>
            ) : tests.length === 0 ? (
                <p className="text-center py-10 text-sm text-[#9b8778]">No completed tests yet.</p>
            ) : (
                <div className="space-y-3">
                    {tests.map(test => {
                        const pct = test.maxMarks > 0 && test.appeared
                            ? Math.round((test.marks / test.maxMarks) * 100)
                            : null;
                        return (
                            <div key={test.testId} className="bg-white border border-[#e8d5c0] rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#2c1a0e] truncate">{test.testName}</p>
                                        <p className="text-xs text-[#9b8778] mt-0.5">
                                            {test.subjectName} · {new Date(test.testDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        {!test.appeared ? (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Absent</span>
                                        ) : (
                                            <>
                                                <span className="text-sm font-bold text-[#2c1a0e]">
                                                    {test.marks}/{test.maxMarks}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${test.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                    {test.passed ? "Pass" : "Fail"}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {test.appeared && pct !== null && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs text-[#9b8778] mb-1">
                                            <span>Score</span>
                                            <span>{pct}%</span>
                                        </div>
                                        <div className="h-1.5 bg-[#f0e4d5] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${pct >= 60 ? "bg-green-500" : pct >= 33 ? "bg-amber-400" : "bg-red-400"}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ParentTestsPage;
