import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaSchool,
  FaChevronLeft,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaMinusCircle,
  FaQuestionCircle,
  FaChevronRight
} from 'react-icons/fa';
import Card from "@/pages/Dashboard/comps/uii/Card.jsx";
import { useSelector } from "react-redux";
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useCombinedStudentAttendance } from './useCombinedStudentAttendance';
import WrapperCard from "@/utilities/WrapperCard.jsx";
import StudentProfile from "@/pages/InfoCenter/StudentProfile.jsx";

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
      <div className="flex gap-6 p-6 flex-1 overflow-hidden ">
        <div className="flex flex-col gap-3 w-120">
          <WrapperCard>
            <Card className="w-full h-[16em] bg-[#f4e3d0] text-[#4a3a2c] px-6 py-4 rounded-2xl flex flex-col gap-4 border border-[#ddb892]">
              <p className="text-lg font-semibold">Batches Overview</p>
              <div className="flex-1 overflow-y-auto pr-1">
                {batches.length > 0 ? (
                    batches.map((batch) => (
                        <div
                            key={batch._id}
                            className="group relative bg-[#e7c6a5] border border-[#ddb892] rounded-xl w-full p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 mb-2"
                        >
                          <div className="flex justify-between items-start mb-1 text-sm font-medium">
                            <p className="text-[#4a3a2c]">{batch.name}</p>
                            <p className="text-[#6b4c3b]">Grade: {batch.forStandard}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center text-sm">
                            <span className="font-medium text-[#6b4c3b]">Subjects:</span>
                            {batch.subject?.length > 0 ? (
                                batch.subject.map((s, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-[#d7b48f]/30 text-[#4a3a2c] rounded-full text-xs font-medium hover:bg-[#d7b48f]/50 transition"
                                    >
                                                        {s.name}
                                                    </span>
                                ))
                            ) : (
                                <span className="text-[#6b4c3b] italic text-xs">None</span>
                            )}
                          </div>
                        </div>
                    ))
                ) : (
                    <p className="text-[#6b4c3b] text-sm">No batches available</p>
                )}
              </div>
              <div className="pt-2 border-t border-[#ddb892]">
                <button
                    onClick={() => navigate('/main/batches')}
                    className="w-full py-2 text-sm font-semibold text-[#4a3a2c] border border-[#d7b48f] rounded-xl bg-[#d7b48f] hover:bg-[#d7b48f]/80 transition"
                >
                  View All Batch Details
                </button>
              </div>
            </Card>
          </WrapperCard>

          <WrapperCard>
            <Card className="w-full bg-[#f4e3d0] text-[#4a3a2c] p-4 rounded-2xl flex flex-col border border-[#ddb892]">
              <div>
                <div className="flex gap-3 mb-2 items-center justify-between">
                  <h2 className="text-lg font-semibold mb-2">Average Attendance</h2>
                  <select
                      value={batchName}
                      onChange={(e) => {
                        setBatchName(e.target.value);
                        setSubjectName('');
                      }}
                      className="border border-[#ddb892] rounded px-2 py-1 text-sm text-[#4a3a2c] bg-[#e7c6a5]"
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
                      className="border border-[#ddb892] rounded px-2 py-1 text-sm text-[#4a3a2c] bg-[#e7c6a5]"
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
                    <div className="flex-1 flex items-center justify-center py-10 text-[#6b4c3b]">
                      <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading...
                    </div>
                ) : (
                    <>
                      <div className="flex-1 flex flex-col gap-4 text-sm">
                        <div className="bg-[#d7b48f]/20 p-3 rounded-lg text-center">
                          <div className="font-semibold text-[#6b4c3b]">Total Students</div>
                          <div className="text-lg font-bold text-[#4a3a2c]">{combinedData.length}</div>
                        </div>
                        <div className="bg-[#d7b48f]/20 p-3 rounded-lg text-center">
                          <div className="font-semibold text-[#6b4c3b]">Filter Applied</div>
                          <div className="text-xs text-[#6b4c3b]">
                            {batchName || subjectName
                                ? `${batchName ? batchName : 'All Batches'}${subjectName ? ` - ${subjectName}` : ''}`
                                : 'All Data'}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="relative inline-flex items-center justify-center">
                          <svg width="120" height="120" className="transform -rotate-90">
                            <circle cx="60" cy="60" r="56" stroke="#e7c6a5" strokeWidth="8" fill="none" />
                            <circle
                                cx="60"
                                cy="60"
                                r="56"
                                stroke={
                                  (() => {
                                    const percentage = combinedData.length > 0
                                        ? Math.round((combinedData.reduce((sum, student) => sum + student.percentage, 0) / combinedData.length) * 100) / 100
                                        : 0;
                                    if (percentage >= 75) return '#d7b48f';
                                    if (percentage >= 50) return '#6b4c3b';
                                    return '#4a3a2c';
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
                              <div className="text-2xl font-bold text-[#4a3a2c]">
                                {combinedData.length > 0
                                    ? Math.round((combinedData.reduce((sum, student) => sum + student.percentage, 0) / combinedData.length) * 100) / 100
                                    : 0
                                }%
                              </div>
                              <div className="text-xs text-[#6b4c3b]">Attendance</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-[#6b4c3b] mt-2">Overall Average Attendance</div>
                      </div>
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
            <Card className="w-full h-full bg-[#f4e3d0] text-[#4a3a2c] p-6 overflow-x-auto rounded-2xl border border-[#ddb892]">
              <h2 className="text-lg font-semibold mb-4">Students Table</h2>
              <div className="flex gap-4 mb-4">
                <select
                    value={batchName}
                    onChange={(e) => {
                      setBatchName(e.target.value);
                      setSubjectName('');
                    }}
                    className="border border-[#ddb892] rounded px-2 py-1 text-sm text-[#4a3a2c] bg-[#e7c6a5]"
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
                    className="border border-[#ddb892] rounded px-2 py-1 text-sm text-[#4a3a2c] bg-[#e7c6a5]"
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
                    className="border border-[#ddb892] rounded px-2 py-1 text-sm text-[#4a3a2c] bg-[#e7c6a5]"
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
                    className="border border-[#ddb892] rounded px-2 py-1 text-sm text-[#4a3a2c] bg-[#e7c6a5]"
                >
                  <option value="">All Attendance</option>
                  <option value=">50">Attendance > 50%</option>
                  <option value="<50">Attendance less 50%</option>
                </select>
              </div>
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              {isLoadingBatches ? (
                  <div className="flex items-center justify-center py-4 text-[#6b4c3b]">
                    <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading data...
                  </div>
              ) : (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                    <tr className="border-b text-[#6b4c3b]">
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
                            <tr key={student.studentId} className="border-t hover:bg-[#e7c6a5]/50">
                              <td className="p-2">{index + 1}</td>
                              <td
                                  className="p-2 hover:cursor-pointer hover:underline text-[#d7b48f]"
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
                          <td colSpan={8} className="p-4 text-center text-[#6b4c3b]">
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
