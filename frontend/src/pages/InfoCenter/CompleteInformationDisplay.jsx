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

  // ✅ CONDITIONAL RENDER
  if (showStudentProfile.show) {
    return <StudentProfile student={showStudentProfile} setShowStudentProfile={setShowStudentProfile} />;
  }

  return (
      <div className="flex gap-6 p-6 flex-1 overflow-hidden">
        <div className="flex flex-col gap-6 w-120">
          <WrapperCard>
            <Card className="w-full h-[240px] bg-white text-gray-800 px-6 py-4 rounded-2xl flex flex-col gap-4">
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
            <Card className="w-full h-full bg-white text-gray-800 p-6 rounded-2xl flex items-start">
              <p className="font-medium">Panel 2</p>
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
