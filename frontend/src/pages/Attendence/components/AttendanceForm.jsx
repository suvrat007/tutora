import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

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

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    useEffect(() => {
        if (success) toast.success(success);
    }, [success]);

    const inputStyles = "w-full border p-2 rounded-md bg-background border-border placeholder-text-light text-text focus:ring-primary focus:border-primary";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white p-6 rounded-2xl shadow-soft border border-border flex-1"
        >
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-light mb-1">Batch</label>
                    <select
                        value={batchName}
                        onChange={(e) => {
                            setBatchName(e.target.value);
                            setSubjectName("");
                            setDate("");
                            resetStudentData();
                        }}
                        className={inputStyles}
                    >
                        <option value="">Select Batch</option>
                        {batches.map((b, i) => (
                            <option key={i} value={b.name}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-light mb-1">Subject</label>
                    <select
                        value={subjectName}
                        onChange={(e) => {
                            setSubjectName(e.target.value);
                            setDate("");
                            resetStudentData();
                        }}
                        className={inputStyles}
                        disabled={!batchName}
                    >
                        <option value="">Select Subject</option>
                        {selectedBatch?.subject.map((s, i) => (
                            <option key={i} value={s.name}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-light mb-1">Date</label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputStyles}
                        disabled={!batchName || !subjectName}
                        max={new Date().toISOString().split("T")[0]}
                    />
                </div>

                <div className="flex gap-2 mt-2">
                    <Button
                        onClick={handleSearch}
                        className="w-1/2"
                        disabled={loading || !batchName || !subjectName || !date}
                    >
                        {loading ? "Searching..." : "Search"}
                    </Button>
                    <Button
                        onClick={clearForm}
                        variant="outline"
                        className="w-1/2"
                        disabled={loading}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};