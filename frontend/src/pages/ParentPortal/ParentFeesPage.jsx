import { useState, useEffect } from "react";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const ParentFeesPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axiosInstance.get("parent/fees")
            .then(res => setData(res.data))
            .catch(() => setError("Failed to load fee data"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#8b5e3c] animate-spin" />
        </div>
    );

    if (error) return <p className="text-center py-10 text-sm text-red-500">{error}</p>;

    const { amount, history } = data;
    const now = new Date();
    const currentEntry = history.find(h => {
        const d = new Date(h.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const paidCount = history.filter(h => h.paid).length;
    const pendingCount = history.filter(h => !h.paid).length;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h2 className="text-lg font-bold text-[#2c1a0e] mb-5">Fee Status</h2>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white border border-[#e8d5c0] rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-[#2c1a0e]">₹{amount?.toLocaleString('en-IN') || 0}</p>
                    <p className="text-xs text-[#9b8778] mt-0.5">Monthly Fee</p>
                </div>
                <div className="bg-white border border-[#e8d5c0] rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-green-600">{paidCount}</p>
                    <p className="text-xs text-[#9b8778] mt-0.5">Paid</p>
                </div>
                <div className="bg-white border border-[#e8d5c0] rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-red-500">{pendingCount}</p>
                    <p className="text-xs text-[#9b8778] mt-0.5">Pending</p>
                </div>
            </div>

            {/* Current month highlight */}
            {currentEntry && (
                <div className={`mb-5 p-4 rounded-2xl border ${currentEntry.paid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <div className="flex items-center gap-2">
                        {currentEntry.paid
                            ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                            : <XCircle className="w-5 h-5 text-red-500" />
                        }
                        <div>
                            <p className={`text-sm font-semibold ${currentEntry.paid ? "text-green-700" : "text-red-600"}`}>
                                This month — {currentEntry.paid ? "Paid" : "Pending"}
                            </p>
                            {currentEntry.paid && currentEntry.paid_at && (
                                <p className="text-xs text-green-600 mt-0.5">
                                    Paid on {new Date(currentEntry.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            )}
                            {!currentEntry.paid && (
                                <p className="text-xs text-red-500 mt-0.5">₹{amount?.toLocaleString('en-IN')} due</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* History table */}
            <div className="bg-white border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-4 bg-[#f5ede3] px-4 py-2.5 text-xs font-semibold text-[#7b5c4b]">
                    <span>Month</span>
                    <span className="text-center">Amount</span>
                    <span className="text-center">Status</span>
                    <span className="text-right">Paid On</span>
                </div>
                {history.length === 0 ? (
                    <p className="text-sm text-[#9b8778] text-center py-6">No fee records found.</p>
                ) : (
                    history.map((entry, i) => {
                        const d = new Date(entry.date);
                        const monthLabel = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                        const isCurrentMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        return (
                            <div
                                key={i}
                                className={`grid grid-cols-4 px-4 py-3 items-center ${i < history.length - 1 ? "border-b border-[#f0e4d5]" : ""} ${isCurrentMonth ? "bg-[#fdf7f2]" : ""}`}
                            >
                                <span className="text-sm text-[#2c1a0e] font-medium">{monthLabel}</span>
                                <span className="text-sm text-center text-[#5a4a3c]">₹{amount?.toLocaleString('en-IN')}</span>
                                <span className="flex justify-center">
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${entry.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                        {entry.paid ? "Paid" : "Pending"}
                                    </span>
                                </span>
                                <span className="text-xs text-right text-[#9b8778]">
                                    {entry.paid && entry.paid_at
                                        ? new Date(entry.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                        : "—"
                                    }
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ParentFeesPage;
