import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from 'framer-motion';
import {
    DollarSign, Users, Building2, GraduationCap
} from 'lucide-react';
import WrapperCard from "@/utilities/WrapperCard.jsx";
import useFetchStudents from "@/pages/useFetchStudents.js";
import FeesTable from "./FeesTable.jsx";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Fees = () => {
    const { batches, students, totalInstituteFees } = useSelector((state) => state.fees);
    const isLoading = !batches || batches.length === 0;
    const fetchStudents = useFetchStudents();

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a3a2c] mx-auto"></div>
                    <p className="mt-4 text-lg text-[#9b8778]">Loading fee data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen p-6 overflow-y-auto">
            <div className="p-2 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-[#4a3a2c]">Fee Management</h1>
                        <DollarSign className="w-6 h-6 text-[#4a3a2c]" />
                    </div>
                </div>

                {/* Summary Cards */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                >
                    {/* Total Fees Card */}
                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="bg-[#fdf5ec] rounded-xl h-full p-6 flex items-center justify-center">
                                <div className="text-center flex gap-5">
                                    <div>
                                        <div
                                            className="w-16 h-16 bg-[#4a3a2c] rounded-full flex items-center justify-center mx-auto mb-4">
                                            <DollarSign className="w-8 h-8 text-white"/>
                                        </div>
                                        <h2 className="text-lg font-semibold text-[#4a3a2c] mb-2">Total Fees</h2>
                                    </div>

                                    <div className={'flex flex-col justify-center items-center'}>
                                        <p className="text-2xl font-bold text-[#4a3a2c]">
                                            ₹{totalInstituteFees.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-[#9b8778] mt-1">To Collect</p>
                                    </div>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>

                    {/* Students Summary */}
                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="bg-[#fdf5ec] rounded-xl h-full p-6 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[#e7c6a5] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-[#4a3a2c]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-[#4a3a2c] mb-2">Students</h2>
                                    <p className="text-2xl font-bold text-[#4a3a2c]">{students.length}</p>
                                    <p className="text-sm text-[#9b8778] mt-1">Total Enrolled</p>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>

                    {/* Batches Summary */}
                    <motion.div variants={fadeInUp}>
                        <WrapperCard>
                            <div className="bg-[#fdf5ec] rounded-xl h-full p-6 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[#d4b896] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-8 h-8 text-[#4a3a2c]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-[#4a3a2c] mb-2">Batches</h2>
                                    <p className="text-2xl font-bold text-[#4a3a2c]">{batches.length}</p>
                                    <p className="text-sm text-[#9b8778] mt-1">Active Batches</p>
                                </div>
                            </div>
                        </WrapperCard>
                    </motion.div>
                </motion.div>

                {/* Batch Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <WrapperCard>
                        <div className="bg-[#fff] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <GraduationCap className="w-5 h-5 text-[#4a3a2c]" />
                                <h3 className="text-xl font-semibold text-[#4a3a2c]">Batch-wise Fee Distribution</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {batches.map((batch) => (
                                    <div key={batch.batchId} className="bg-[#fdf5ec] p-4 rounded-lg border border-[#e7c6a5]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-[#4a3a2c] flex items-center justify-center text-white text-sm font-bold">
                                                {batch.batchName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#4a3a2c]">{batch.batchName}</h4>
                                                <p className="text-xs text-[#9b8778]">Class {batch.forStandard}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-center">
                                                <p className="text-sm text-[#9b8778]">Students</p>
                                                <p className="font-semibold text-[#4a3a2c]">{batch.students.length}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-[#9b8778]">Total Fees</p>
                                                <p className="font-semibold text-[#4a3a2c]">₹{batch.totalFees.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </WrapperCard>
                </motion.div>

                <FeesTable
                    batches={batches}
                    students={students}
                    fetchStudents={fetchStudents}
                />
            </div>
        </div>
    );
};

export default Fees;