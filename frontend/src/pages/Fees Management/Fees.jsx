import { useSelector } from "react-redux";
import { motion } from 'framer-motion';
import {
    DollarSign, Users, Building2, GraduationCap
} from 'lucide-react';
import FeesTable from "./FeesTable.jsx";
import useFetchStudents from "@/pages/useFetchStudents.js";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Fees = () => {
    const { batches, students, totalInstituteFees } = useSelector((state) => state.fees);
    const isLoading = !batches || batches.length === 0;
    const fetchStudents = useFetchStudents();

    const totalPaidAmount = students.reduce((sum, student) => {
        return student.isPaidThisMonth ? sum + (student.amount || 0) : sum;
    }, 0);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-lg text-text-light">Loading fee data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen p-6 overflow-y-auto bg-background">
            <div className="p-2 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-text">Fee Management</h1>
                        <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                </div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                >
                    <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-soft border border-border h-full p-6 flex items-center justify-center">
                        <div className="text-center flex gap-5">
                            <div>
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <DollarSign className="w-8 h-8 text-white"/>
                                </div>
                                <h2 className="text-lg font-semibold text-text mb-2">Fee Summary</h2>
                            </div>
                            <div className={'flex flex-col justify-center items-center'}>
                                <p className="text-2xl font-bold text-text">
                                    ₹{totalInstituteFees.toLocaleString()}
                                </p>
                                <p className="text-sm text-text-light mt-1">To Collect</p>
                                <p className="text-2xl font-bold text-text mt-2">
                                    ₹{totalPaidAmount.toLocaleString()}
                                </p>
                                <p className="text-sm text-text-light mt-1">Collected</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-soft border border-border h-full p-6 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-text" />
                            </div>
                            <h2 className="text-lg font-semibold text-text mb-2">Students</h2>
                            <p className="text-2xl font-bold text-text">{students.length}</p>
                            <p className="text-sm text-text-light mt-1">Total Enrolled</p>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-soft border border-border h-full p-6 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-text mb-2">Batches</h2>
                            <p className="text-2xl font-bold text-text">{batches.length}</p>
                            <p className="text-sm text-text-light mt-1">Active Batches</p>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="bg-white rounded-xl p-6 shadow-soft border border-border">
                        <div className="flex items-center gap-2 mb-4">
                            <GraduationCap className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-semibold text-text">Batch-wise Fee Distribution</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {batches.map((batch) => (
                                <div key={batch.batchId} className="bg-background p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                                            {batch.batchName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-text">{batch.batchName}</h4>
                                            <p className="text-xs text-text-light">Class {batch.forStandard}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-center">
                                            <p className="text-sm text-text-light">Students</p>
                                            <p className="font-semibold text-text">{batch.students.length}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-text-light">Total Fees</p>
                                            <p className="font-semibold text-text">₹{batch.totalFees.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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