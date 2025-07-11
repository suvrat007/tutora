import React, { useState } from 'react';
import Card from '../Dashboard/comps/uii/Card.jsx';
import { useCombinedStudentAttendance } from './useCombinedStudentAttendance';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import StudentProfile from "@/pages/InfoCenter/StudentProfile.jsx";

const WrapperCard = ({ children }) => (
    <div className="relative bg-[#f3d8b6] rounded-3xl shadow-lg p-2 flex flex-1 justify-center items-center">
      <div className="w-full h-full">{children}</div>
    </div>
);

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
      <div className="flex gap-6 p-6 flex-1 overflow-hidden">
        <div className="flex flex-col gap-3 w-120">
          <WrapperCard>
            <Card className="w-full h-[16em] bg-white text-gray-800 px-6 py-4 rounded-2xl flex flex-col gap-4">
              <p className="text-lg font-semibold">Batches Overview</p>
              <div className="flex-1 overflow-y-auto pr-1">
                {batches.length > 0 ? (
                    batches.map((batch) => (
                        <div
                            key={batch._id}
                            className="group relative bg-[#faf7f2] border border-gray-300 rounded-xl w-full p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 mb-2"
                        >
                          <div className="flex justify-between items-start mb-1 text-sm font-medium">
                            <p className="text-gray-800">{batch.name}</p>
                            <p className="text-gray-600">Grade: {batch.forStandard}</p>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center text-sm">
                            <span className="font-medium text-gray-700">Subjects:</span>
                            {batch.subject?.length > 0 ? (
                                batch.subject.map((s, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition"
                                    >
                            {s.name}
                          </span>
                                ))
                            ) : (
                                <span className="text-gray-500 italic text-xs">None</span>
                            )}
                          </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm">No batches available</p>
                )}
              </div>

              <div className="pt-2 border-t border-gray-200">
                <button
                    onClick={() => navigate('/main/batches')}
                    className="w-full py-2 text-sm font-semibold text-indigo-600 border border-indigo-500 rounded-xl hover:bg-indigo-50 transition"
                >
                  View All Batch Details
                </button>
              </div>
            </Card>
          </WrapperCard>

          <WrapperCard>
            <Card className="w-full bg-white text-gray-800 p-4 rounded-2xl flex flex-col">
              <div>

                <div className="flex gap-3 mb-2 items-center justify-between">
                  <h2 className="text-lg font-semibold mb-2">Average Attendance</h2>

                  <select
                      value={batchName}
                      onChange={(e) => {
                        setBatchName(e.target.value);
                        setSubjectName('');
                      }}
                      className="border rounded px-2 py-1 text-sm text-gray-700"
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
                      className="border rounded px-2 py-1 text-sm text-gray-700"
                      disabled={!batchName || isLoadingBatches}
                  >
                    <option value="">All Subjects</option>
                    {batches.find((b) => b.name === batchName)?.subject?.map((s) => (
                        <option key={s._id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {isLoadingBatches ? (
                    <div className="flex-1 flex items-center justify-center py-10 text-gray-500">
                      <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading...
                    </div>
                ) : (
                    <>
                      {/* Left (Total + Filter) */}
                      <div className="flex-1 flex flex-col gap-4 text-sm">
                        <div className="bg-gray-100 p-3 rounded-lg text-center">
                          <div className="font-semibold text-gray-700">Total Students</div>
                          <div className="text-lg font-bold text-gray-900">{combinedData.length}</div>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg text-center">
                          <div className="font-semibold text-gray-700">Filter Applied</div>
                          <div className="text-xs text-gray-600">
                            {batchName || subjectName
                                ? `${batchName ? batchName : 'All Batches'}${subjectName ? ` - ${subjectName}` : ''}`
                                : 'All Data'}
                          </div>
                        </div>
                      </div>

                      {/* Center (Circular Attendance) */}
                      <div className="flex-1 flex flex-col items-center">
                        <div className="relative inline-flex items-center justify-center">
                          <svg width="120" height="120" className="transform -rotate-90">
                            <circle cx="60" cy="60" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                            <circle
                                cx="60"
                                cy="60"
                                r="56"
                                stroke={
                                  (() => {
                                    const percentage = combinedData.length > 0
                                        ? Math.round((combinedData.reduce((sum, student) => sum + student.percentage, 0) / combinedData.length) * 100) / 100
                                        : 0;
                                    if (percentage >= 75) return '#10b981';
                                    if (percentage >= 50) return '#f59e0b';
                                    return '#ef4444';
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
                              <div className="text-2xl font-bold text-gray-800">
                                {combinedData.length > 0
                                    ? Math.round((combinedData.reduce((sum, student) => sum + student.percentage, 0) / combinedData.length) * 100) / 100
                                    : 0
                                }%
                              </div>
                              <div className="text-xs text-gray-500">Attendance</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">Overall Average Attendance</div>
                      </div>

                      {/* Right (Breakdown) */}
                      <div className="flex-1 grid grid-cols-1 gap-2 text-xs">
                        <div className="bg-red-50 p-2 rounded text-center">
                          <div className="font-semibold text-red-700">Below 50%</div>
                          <div className="text-red-900">
                            {combinedData.filter(s => s.percentage < 50).length} students
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded text-center">
                          <div className="font-semibold text-yellow-700">50% - 75%</div>
                          <div className="text-yellow-900">
                            {combinedData.filter(s => s.percentage >= 50 && s.percentage < 75).length} students
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center">
                          <div className="font-semibold text-green-700">75% & Above</div>
                          <div className="text-green-900">
                            {combinedData.filter(s => s.percentage >= 75).length} students
                          </div>
                        </div>
                      </div>
                    </>
                )}
              </div>
            </Card>
          </WrapperCard>

        </div>

        <div className="flex gap-6 flex-1">
          <WrapperCard>
            <Card className="w-full h-full bg-white text-gray-800 p-6 overflow-x-auto rounded-2xl">
              <h2 className="text-lg font-semibold mb-4">Students Table</h2>

              <div className="flex gap-4 mb-4">
                <select
                    value={batchName}
                    onChange={(e) => {
                      setBatchName(e.target.value);
                      setSubjectName('');
                    }}
                    className="border rounded px-2 py-1 text-sm text-gray-700"
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
                    className="border rounded px-2 py-1 text-sm text-gray-700"
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
                    className="border rounded px-2 py-1 text-sm text-gray-700"
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
                    className="border rounded px-2 py-1 text-sm text-gray-700"
                >
                  <option value="">All Attendance</option>
                  <option value=">50">Attendance > 50%</option>
                  <option value="<50">Attendance less 50%</option>
                </select>
              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              {isLoadingBatches ? (
                  <div className="flex items-center justify-center py-4 text-gray-500">
                    <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading data...
                  </div>
              ) : (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                    <tr className="border-b text-gray-600">
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
                            <tr key={student.studentId} className="border-t hover:bg-gray-50">
                              <td className="p-2">{index + 1}</td>
                              <td
                                  className="p-2 hover:cursor-pointer hover:underline text-indigo-600"
                                  onClick={() => handleStudentDisplay(student)}
                              >
                                {student.studentName}
                              </td>
                              <td className="p-2">{student.grade}</td>
                              <td className="p-2">{student.batchName}</td>
                              <td className="p-2">{getStudentSubjects(student.studentId, student.batchId)}</td>
                              <td className="p-2">{student.percentage}%</td>
                              <td className="p-2">{student.school_name}</td>
                              <td className="p-2">{student.contact_info?.phoneNumbers?.student || 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                          <td colSpan={8} className="p-4 text-center text-gray-500">
                            No students match the current filters
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
              )}
            </Card>
          </WrapperCard>
        </div>
      </div>
  );
};

export default CompleteInformationDisplay;
