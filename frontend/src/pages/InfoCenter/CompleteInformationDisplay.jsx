import React, { useState } from 'react';
import { useCombinedStudentAttendance } from './useCombinedStudentAttendance';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import StudentProfile from "@/pages/InfoCenter/StudentProfile.jsx";
import { motion, AnimatePresence } from "framer-motion";

const CompleteInformationDisplay = () => {
  const [batchName, setBatchName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('');
  const [showStudentProfile, setShowStudentProfile] = useState({ show: false, student: null });

  const navigate = useNavigate();

  const batches = useSelector((state) => state.batches) || [];
  const isLoadingBatches = useSelector((state) => state.batches.loading);
  const { data: combinedData, error } = useCombinedStudentAttendance(batchName, subjectName, batches);

  const uniqueGrades = [...new Set(batches.map((b) => b.forStandard))].sort();

  const filteredData = combinedData.filter((student) => {
    const matchesGrade = gradeFilter ? student.grade?.toString() === gradeFilter : true;
    const matchesAttendance =
        attendanceFilter === '>50'
            ? student.percentage > 50
            : attendanceFilter === '<50'
                ? student.percentage < 50
                : true;
    return matchesGrade && matchesAttendance;
  });

  const getStudentSubjects = (studentId, batchId) => {
    const batch = batches.find((b) => b._id === batchId);
    const student = batch?.students?.find((s) => s._id === studentId);
    if (!student || !student.subjectId) return 'None';

    const subjectNames = student.subjectId
        .map((sid) => batch?.subject?.find((s) => s._id === sid)?.name)
        .filter(Boolean)
        .join(', ');
    return subjectNames || 'None';
  };

  const handleStudentDisplay = (std) => {
    setShowStudentProfile({
      show: true,
      student: std,
    });
  };

  if (showStudentProfile.show) {
    return <StudentProfile student={showStudentProfile} setShowStudentProfile={setShowStudentProfile} />;
  }

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row gap-6 p-6 flex-1 overflow-hidden bg-background"
      >
        <div className="flex flex-col gap-6 w-full lg:w-1/3">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-soft p-6 flex flex-col flex-1 border border-border"
          >
            <p className="text-lg font-semibold text-text mb-4">Batches Overview</p>
            <div className="flex-1 overflow-y-auto pr-1">
              {batches.length > 0 ? (
                  batches.map((batch) => (
                      <motion.div
                          key={batch._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                          className="group relative bg-background border border-border rounded-xl w-full p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 mb-2"
                      >
                        <div className="flex justify-between items-start mb-1 text-sm font-medium">
                          <p className="text-text">{batch.name}</p>
                          <p className="text-text-light">Grade: {batch.forStandard}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center text-sm">
                          <span className="font-medium text-text">Subjects:</span>
                          {batch.subject?.length > 0 ? (
                              batch.subject.map((s, idx) => (
                                  <span
                                      key={idx}
                                      className="px-3 py-1 bg-accent-light text-text rounded-full text-xs font-medium hover:bg-accent transition"
                                  >
                            {s.name}
                          </span>
                              ))
                          ) : (
                              <span className="text-text-light italic text-xs">None</span>
                          )}
                        </div>
                      </motion.div>
                  ))
              ) : (
                  <p className="text-text-light text-sm">No batches available</p>
              )}
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <button
                  onClick={() => navigate('/main/batches')}
                  className="w-full py-2 text-sm font-semibold text-primary border border-primary rounded-xl hover:bg-primary hover:text-white transition"
              >
                View All Batch Details
              </button>
            </div>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-soft p-6 flex flex-col flex-1 border border-border"
          >
            <div className="flex gap-3 mb-4 items-center justify-between">
              <h2 className="text-lg font-semibold text-text">Average Attendance</h2>

              <select
                  value={batchName}
                  onChange={(e) => {
                    setBatchName(e.target.value);
                    setSubjectName('');
                  }}
                  className="border border-border rounded px-2 py-1 text-sm text-text bg-background"
                  disabled={isLoadingBatches}
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                    <option key={b._id} value={b.name}>{b.name}</option>
                ))}
              </select>

              <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="border border-border rounded px-2 py-1 text-sm text-text bg-background"
                  disabled={!batchName || isLoadingBatches}
              >
                <option value="">All Subjects</option>
                {batches.find((b) => b.name === batchName)?.subject?.map((s) => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {error && <p className="text-error text-sm">{error}</p>}
              {isLoadingBatches ? (
                  <div className="flex-1 flex items-center justify-center py-10 text-text-light">
                    <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading...
                  </div>
              ) : (
                  <>
                    <div className="flex-1 flex flex-col gap-4 text-sm">
                      <div className="bg-background p-3 rounded-lg text-center border border-border">
                        <div className="font-semibold text-text">Total Students</div>
                        <div className="text-lg font-bold text-text">{combinedData.length}</div>
                      </div>
                      <div className="bg-background p-3 rounded-lg text-center border border-border">
                        <div className="font-semibold text-text">Filter Applied</div>
                        <div className="text-xs text-text-light">
                          {batchName || subjectName
                              ? `${batchName ? batchName : 'All Batches'}${subjectName ? ` - ${subjectName}` : ''}`
                              : 'All Data'}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center">
                      <div className="relative inline-flex items-center justify-center">
                        <svg width="120" height="120" className="transform -rotate-90">
                          <circle cx="60" cy="60" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                          <motion.circle
                              cx="60"
                              cy="60"
                              r="56"
                              stroke={
                                (() => {
                                  const percentage = combinedData.length > 0
                                      ? Math.round((combinedData.reduce((sum, student) => sum + student.percentage, 0) / combinedData.length) * 100) / 100
                                      : 0;
                                  if (percentage >= 75) return '#5CB85C';
                                  if (percentage >= 50) return '#F0AD4E';
                                  return '#D9534F';
                                })()
                              }
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray="351.858"
                              strokeDashoffset={
                                (() => {
                                  const percentage = combinedData.length > 0
                                      ? Math.round((combinedData.reduce((sum, student) => sum + student.percentage, 0) / combinedData.length) * 100) / 100
                                      : 0;
                                  return 351.858 - (percentage / 100) * 351.858;
                                })()
                              }
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-text">
                              {combinedData.length > 0
                                  ? Math.round((combinedData.reduce((sum, student) => sum + student.percentage, 0) / combinedData.length) * 100) / 100
                                  : 0
                              }%
                            </div>
                            <div className="text-xs text-text-light">Attendance</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-text-light mt-2">Overall Average Attendance</div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 gap-2 text-xs">
                      <div className="bg-error/10 p-2 rounded text-center border border-error/20">
                        <div className="font-semibold text-error">Below 50%</div>
                        <div className="text-error">
                          {combinedData.filter(s => s.percentage < 50).length} students
                        </div>
                      </div>
                      <div className="bg-warning/10 p-2 rounded text-center border border-warning/20">
                        <div className="font-semibold text-warning">50% - 75%</div>
                        <div className="text-warning">
                          {combinedData.filter(s => s.percentage >= 50 && s.percentage < 75).length} students
                        </div>
                      </div>
                      <div className="bg-success/10 p-2 rounded text-center border border-success/20">
                        <div className="font-semibold text-success">75% & Above</div>
                        <div className="text-success">
                          {combinedData.filter(s => s.percentage >= 75).length} students
                        </div>
                      </div>
                    </div>
                  </>
              )}
            </div>
          </motion.div>

        </div>

        <div className="flex flex-col flex-1">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-soft p-6 overflow-x-auto flex-1 border border-border"
          >
            <h2 className="text-lg font-semibold text-text mb-4">Students Table</h2>

            <div className="flex flex-wrap gap-4 mb-4">
              <select
                  value={batchName}
                  onChange={(e) => {
                    setBatchName(e.target.value);
                    setSubjectName('');
                  }}
                  className="border border-border rounded px-2 py-1 text-sm text-text bg-background"
                  disabled={isLoadingBatches}
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                    <option key={b._id} value={b.name}>
                      {b.name}
                    </option>
                ))}
              </select>

              <select
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="border border-border rounded px-2 py-1 text-sm text-text bg-background"
                  disabled={!batchName || isLoadingBatches}
              >
                <option value="">All Subjects</option>
                {batches.find((b) => b.name === batchName)?.subject?.map((s) => (
                    <option key={s._id} value={s.name}>
                      {s.name}
                    </option>
                ))}
              </select>

              <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="border border-border rounded px-2 py-1 text-sm text-text bg-background"
              >
                <option value="">All Grades</option>
                {uniqueGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                ))}
              </select>

              <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  className="border border-border rounded px-2 py-1 text-sm text-text bg-background"
              >
                <option value="">All Attendance</option>
                <option value=">50">Attendance > 50%</option>
                <option value="<50">Attendance less 50%</option>
              </select>
            </div>

            {error && <p className="text-error text-sm mb-4">{error}</p>}
            {isLoadingBatches ? (
                <div className="flex items-center justify-center py-4 text-text-light">
                  <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading data...
                </div>
            ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                  <tr className="border-b border-border text-text-light">
                    <th className="p-2">Sr No</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Grade</th>
                    <th className="p-2">Batch</th>
                    <th className="p-2">Subjects</th>
                    <th className="p-2">Attendance %</th>
                    <th className="p-2">School</th>
                    <th className="p-2">Contact No</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredData.length > 0 ? (
                      filteredData.map((student, index) => (
                          <motion.tr
                              key={student.studentId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.02 }}
                              className="border-t border-border hover:bg-background cursor-pointer"
                              onClick={() => handleStudentDisplay(student)}
                          >
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2 text-primary hover:underline">
                              {student.studentName}
                            </td>
                            <td className="p-2">{student.grade}</td>
                            <td className="p-2">{student.batchName}</td>
                            <td className="p-2">{getStudentSubjects(student.studentId, student.batchId)}</td>
                            <td className="p-2">{student.percentage}%</td>
                            <td className="p-2">{student.school_name}</td>
                            <td className="p-2">{student.contact_info?.phoneNumbers?.student || 'N/A'}</td>
                          </motion.tr>
                      ))
                  ) : (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-text-light">
                          No students match the current filters
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
            )}
          </motion.div>
        </div>
      </motion.div>
  );
};

export default CompleteInformationDisplay;