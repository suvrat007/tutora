import React from "react";

export const AttendanceForm = ({
                            batchName, setBatchName,
                            subjectName, setSubjectName,
                            date, setDate,
                            batches,
                            error, success,
                            loading,
                            resetStudentData,
                            clearForm,
                            handleSearch
                        }) => {
    const selectedBatch = batches.find((b) => b.name === batchName);

    return (
        <div className="bg-[#f4d8bb] p-2 rounded-3xl shadow-md flex-1">
            <div className="bg-white rounded-2xl p-4 text-black flex flex-col gap-3">
                <select
                    value={batchName}
                    onChange={(e) => {
                        setBatchName(e.target.value);
                        setSubjectName("");
                        setDate("");
                        resetStudentData();
                    }}
                    className="border p-2 rounded-md"
                >
                    <option value="">Select Batch</option>
                    {batches.map((b, i) => (
                        <option key={i} value={b.name}>
                            {b.name}
                        </option>
                    ))}
                </select>

                <select
                    value={subjectName}
                    onChange={(e) => {
                        setSubjectName(e.target.value);
                        setDate("");
                        resetStudentData();
                    }}
                    className="border p-2 rounded-md"
                    disabled={!batchName}
                >
                    <option value="">Select Subject</option>
                    {selectedBatch?.subject.map((s, i) => (
                        <option key={i} value={s.name}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-2 rounded-md"
                    disabled={!batchName || !subjectName}
                    max={new Date().toISOString().split("T")[0]}
                />

                {error && <p className="text-red-600 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}

                <div className="flex gap-2">
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white p-2 rounded-md w-1/2 hover:bg-blue-600 transition-colors"
                        disabled={loading || !batchName || !subjectName || !date}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                    <button
                        onClick={clearForm}
                        className="bg-gray-500 text-white p-2 rounded-md w-1/2 hover:bg-gray-600 transition-colors"
                        disabled={loading}
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};