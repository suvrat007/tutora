import { useNavigate } from 'react-router-dom';
import Card from "@/pages/Dashboard/comps/uii/Card.jsx";
import { useSelector } from "react-redux";
import { useState, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useCombinedStudentAttendance } from './useCombinedStudentAttendance';
import WrapperCard from "@/utilities/WrapperCard.jsx";
import StudentProfile from "@/pages/InfoCenter/StudentProfile.jsx";
import toast from "react-hot-toast";

const CompleteInformationDisplay = () => {
  const navigate = useNavigate();
  const [batchName, setBatchName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('');
  const [showStudentProfile, setShowStudentProfile] = useState({ show: false, student: null });

  const batches = useSelector((state) => state.batches) || [];
  const isLoadingBatches = useSelector((state) => state.batches.loading);

  const { data: combinedData = [], error, loading: loadingAttendance } = useCombinedStudentAttendance(batchName, subjectName, batches);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const uniqueGrades = useMemo(() => [...new Set(batches.map((b) => b.forStandard))].sort(), [batches]);

  const filteredData = useMemo(() => {
    return combinedData.filter((student) => {
      const matchesGrade = gradeFilter ? student.grade?.toString() === gradeFilter : true;
      const matchesAttendance =
          attendanceFilter === '>50'
              ? student.percentage > 50
              : attendanceFilter === '<50'
                  ? student.percentage < 50
                  : true;
      return matchesGrade && matchesAttendance;
    });
  }, [combinedData, gradeFilter, attendanceFilter]);

  const getStudentSubjects = (studentId, batchId) => {
    const batch = batches.find((b) => b._id === batchId);
    const student = batch?.students?.find((s) => s._id === studentId);
    if (!student?.subjectId?.length) return 'None';
    return student.subjectId
        .map((sid) => batch?.subject?.find((s) => s._id === sid)?.name)
        .filter(Boolean)
        .join(', ') || 'None';
  };

  const avgAttendance = useMemo(() => {
    if (combinedData.length === 0) return 0;
    const sum = combinedData.reduce((acc, cur) => acc + cur.percentage, 0);
    return Math.round((sum / combinedData.length) * 100) / 100;
  }, [combinedData]);

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return '#d7b48f';
    if (percentage >= 50) return '#6b4c3b';
    return '#4a3a2c';
  };

  const handleStudentDisplay = (std) => {
    setShowStudentProfile({ show: true, student: std });
  };

  const renderDropdown = (value, setValue, options, placeholder, disabled = false) => (
      <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border border-[#ddb892] rounded px-2 py-1 text-sm text-[#4a3a2c] bg-[#f0d9c0]"
          disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) =>
            typeof opt === 'object' ? (
                <option key={opt._id} value={opt.name}>{opt.name}</option>
            ) : (
                <option key={opt} value={opt}>{opt}</option>
            )
        )}
      </select>
  );

  if (showStudentProfile.show) {
    return <StudentProfile student={showStudentProfile} setShowStudentProfile={setShowStudentProfile} />;
  }

  return (
      <div className="flex flex-col md:flex-row gap-6 p-4 overflow-y-auto w-full h-full">
        {/* Left Panel */}
        <div className="grid grid-rows-2 gap-3 w-full md:w-[50%] max-h-full">
          {/* Batches Overview */}
          <WrapperCard>
            <Card className="w-full h-full bg-[#f8ede3] text-[#4a3a2c] px-6 py-4 rounded-2xl flex flex-col gap-4 border border-[#ddb892]">
              <p className="text-lg font-semibold">Batches Overview</p>
              <div className="flex-1 overflow-y-auto pr-1">
                {batches.length > 0 ? (
                    batches.map((batch) => (
                        <div
                            key={batch._id}
                            className="group relative bg-[#f0d9c0] border border-[#ddb892] rounded-xl p-4 mb-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="flex justify-between text-sm font-medium mb-1">
                            <p>{batch.name}</p>
                            <p>Grade: {batch.forStandard}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center text-sm">
                            <span className="font-medium">Subjects:</span>
                            {batch.subject?.length ? (
                                batch.subject.map((s, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-[#d7b48f]/30 text-[#4a3a2c] rounded-full text-xs font-medium hover:bg-[#d7b48f]/50"
                                    >
                                      {s.name}
                                    </span>
                                ))
                            ) : (
                                <span className="italic text-xs">None</span>
                            )}
                          </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm">No batches available</p>
                )}
              </div>
              <div className="pt-2 border-t border-[#ddb892]">
                <button
                    onClick={() => navigate('/main/batches')}
                    className="w-full py-2 text-sm font-semibold border border-[#d7b48f] rounded-xl bg-[#f0d9c0] hover:bg-[#d7b48f]/80 transition"
                >
                  View All Batch Details
                </button>
              </div>
            </Card>
          </WrapperCard>

          {/* Attendance Summary */}
          <WrapperCard>
            <Card className="w-full h-full bg-[#f8ede3] text-[#4a3a2c] p-4 rounded-2xl flex flex-col border border-[#ddb892]">
              {/* Header — always one row */}
              <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                <h2 className="text-base font-semibold shrink-0">Avg. Attendance</h2>
                <div className="flex gap-2 shrink-0">
                  {renderDropdown(batchName, (v) => { setBatchName(v); setSubjectName(''); }, batches, "All Batches", isLoadingBatches)}
                  {renderDropdown(subjectName, setSubjectName, batches.find((b) => b.name === batchName)?.subject || [], "All Subjects", !batchName)}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0">
                {isLoadingBatches ? (
                    <div className="h-full flex justify-center items-center">
                      <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading...
                    </div>
                ) : (
                    <div className="h-full flex flex-col gap-3">
                      {/* 3-col row: stats | circle | distribution */}
                      <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
                        {/* Stats */}
                        <div className="flex flex-col gap-2 text-sm justify-center">
                          <div className="bg-[#d7b48f]/20 p-2 rounded-lg text-center">
                            <div className="text-xs font-semibold text-[#6b4c3b]">Students</div>
                            <div className="text-2xl font-bold">{combinedData.length}</div>
                          </div>
                          <div className="bg-[#d7b48f]/20 p-2 rounded-lg text-center">
                            <div className="text-xs font-semibold text-[#6b4c3b]">Filter</div>
                            <div className="text-xs truncate mt-0.5">
                              {batchName || subjectName
                                  ? `${batchName || 'All'}${subjectName ? ` · ${subjectName}` : ''}`
                                  : 'None'}
                            </div>
                          </div>
                        </div>

                        {/* Circle */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative">
                            <svg width="100" height="100" className="-rotate-90">
                              <circle cx="50" cy="50" r="44" stroke="#e7c6a5" strokeWidth="8" fill="none" />
                              <circle
                                  cx="50" cy="50" r="44"
                                  stroke={getAttendanceColor(avgAttendance)}
                                  strokeWidth="8"
                                  fill="none"
                                  strokeDasharray="276.46"
                                  strokeDashoffset={276.46 - (avgAttendance / 100) * 276.46}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-center">
                              <div>
                                <div className="text-lg font-bold leading-tight">{avgAttendance}%</div>
                                <div className="text-[9px] text-[#6b4c3b]">Overall</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Distribution */}
                        <div className="flex flex-col gap-2 justify-center text-xs">
                          <div className="bg-red-50 px-2 py-2 rounded-lg text-center">
                            <div className="font-semibold text-red-700 text-[10px]">Below 50%</div>
                            <div className="font-bold text-base">{combinedData.filter(s => s.percentage < 50).length}</div>
                          </div>
                          <div className="bg-yellow-50 px-2 py-2 rounded-lg text-center">
                            <div className="font-semibold text-yellow-700 text-[10px]">50%–75%</div>
                            <div className="font-bold text-base">{combinedData.filter(s => s.percentage >= 50 && s.percentage < 75).length}</div>
                          </div>
                          <div className="bg-green-50 px-2 py-2 rounded-lg text-center">
                            <div className="font-semibold text-green-700 text-[10px]">75%+</div>
                            <div className="font-bold text-base">{combinedData.filter(s => s.percentage >= 75).length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </Card>
          </WrapperCard>
        </div>

        {/* Right Panel */}
        <div className="w-full">
          <WrapperCard>
            <Card className="w-full h-[35em] sm:h-full bg-[#f8ede3] text-[#4a3a2c] p-6 overflow-x-auto rounded-2xl border border-[#ddb892]">
              <h2 className="text-lg font-semibold mb-4">Students Table</h2>
              <div className="flex gap-4 mb-4 flex-wrap">
                {renderDropdown(batchName, (v) => { setBatchName(v); setSubjectName(''); }, batches, "All Batches", isLoadingBatches)}
                {renderDropdown(subjectName, setSubjectName, batches.find((b) => b.name === batchName)?.subject || [], "All Subjects", !batchName)}
                {renderDropdown(gradeFilter, setGradeFilter, uniqueGrades, "All Grades")}
                {renderDropdown(attendanceFilter, setAttendanceFilter, ['>50', '<50'], "All Attendance")}
              </div>

              {isLoadingBatches || loadingAttendance ? (
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
                                  className="p-2 hover:cursor-pointer hover:underline"
                                  onClick={() => handleStudentDisplay(student)}
                              >
                                {student.studentName}
                              </td>
                              <td className="p-2">{student.grade}</td>
                              <td className="p-2">{student.batchName}</td>
                              <td className="p-2">{student.subjects}</td>
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