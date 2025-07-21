import { motion} from "framer-motion";
import {Loader2} from "lucide-react";

export const AttendanceForm = ({
                                   batchName,
                                   setBatchName,
                                   subjectName,
                                   setSubjectName,
                                   date,
                                   setDate,
                                   batches,
                                   error,
                                   success,
                                   loading,
                                   resetStudentData,
                                   clearForm,
                                   handleSearch,
                               }) => {
    const selectedBatch = batches.find((b) => b.name === batchName);

    const placeholderVariants = {
        pulse: {
            scale: [1, 1.1, 1],
            transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-[#f8ede3] p-4 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex-1 w-full h-full overflow-hidden"
        >
            <div className="flex flex-col gap-4 h-full">
                <select
                    value={batchName}
                    onChange={(e) => {
                        setBatchName(e.target.value);
                        setSubjectName("");
                        setDate("");
                        resetStudentData();
                    }}
                    className="border border-[#e6c8a8] p-2 rounded-md text-sm text-[#5a4a3c] bg-[#f8ede3] focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
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
                    className="border border-[#e6c8a8] p-2 rounded-md text-sm text-[#5a4a3c] bg-[#f8ede3] focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
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
                    className="border border-[#e6c8a8] p-2 rounded-md text-sm text-[#5a4a3c] bg-[#f8ede3] focus:ring-[#e0c4a8] focus:border-[#e0c4a8]"
                    disabled={!batchName || !subjectName}
                    max={new Date().toISOString().split("T")[0]}
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {success && <p className="text-[#34C759] text-sm">{success}</p>}
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSearch}
                        className="bg-[#e0c4a8] text-[#5a4a3c] p-2 rounded-md w-1/2 hover:bg-[#d8bca0] transition-all duration-300 disabled:opacity-50 shadow-md"
                        disabled={loading || !batchName || !subjectName || !date}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4 inline mr-2" />
                                Searching...
                            </>
                        ) : (
                            "Search"
                        )}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearForm}
                        className="bg-[#e0c4a8] text-[#5a4a3c] p-2 rounded-md w-1/2 hover:bg-[#d8bca0] transition-all duration-300 disabled:opacity-50 shadow-md"
                        disabled={loading}
                    >
                        Clear
                    </motion.button>
                </div>
                {!batchName && !subjectName && !date && (
                    <motion.div
                        variants={placeholderVariants}
                        animate="pulse"
                        className="flex flex-col items-center justify-center h-full text-[#7b5c4b]"
                    >
                        {/*<FiCalendar className="w-12 h-12 text-[#e0c4a8] mb-3" />*/}
                        <p className="text-sm text-center">Select a batch, subject, and date to start!</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};