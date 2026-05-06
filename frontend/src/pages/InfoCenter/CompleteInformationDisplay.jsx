import Card from "@/pages/Dashboard/comps/uii/Card.jsx";
import { useSelector } from "react-redux";
import { useState, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useCombinedStudentAttendance } from './useCombinedStudentAttendance';
import WrapperCard from "@/components/ui/WrapperCard.jsx";
import StudentProfile from "@/pages/InfoCenter/StudentProfile.jsx";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";

const CompleteInformationDisplay = () => {
  const [batchName, setBatchName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('');
  const [showStudentProfile, setShowStudentProfile] = useState({ show: false, student: null });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const batches = useSelector((state) => state.batches) || [];
  const isLoadingBatches = useSelector((state) => state.batches.loading);
  const allTests = useSelector((state) => state.tests.tests) || [];

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

  useEffect(() => { setPage(1); }, [combinedData, gradeFilter, attendanceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedData = filteredData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const getStudentSubjects = (studentId, batchId) => {
    const batch = batches.find((b) => b._id === batchId);
    const student = batch?.students?.find((s) => s._id === studentId);
    if (!student?.subjectId?.length) return 'None';
    return student.subjectId
        .map((sid) => batch?.subject?.find((s) => s._id === sid)?.name)
        .filter(Boolean)
        .join(', ') || 'None';
  };

  const testScoreByStudent = useMemo(() => {
    const map = {};
    allTests.forEach(test => {
      test.studentResults?.forEach(r => {
        if (!r.appeared) return;
        const sid = (r.studentId?._id || r.studentId)?.toString();
        if (!sid) return;
        if (!map[sid]) map[sid] = { totalMarks: 0, totalMax: 0 };
        map[sid].totalMarks += r.marks || 0;
        map[sid].totalMax += test.maxMarks || 0;
      });
    });
    const result = {};
    Object.entries(map).forEach(([sid, { totalMarks, totalMax }]) => {
      result[sid] = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
    });
    return result;
  }, [allTests]);

  const avgAttendance = useMemo(() => {
    if (combinedData.length === 0) return 0;
    const sum = combinedData.reduce((acc, cur) => acc + cur.percentage, 0);
    return Math.round((sum / combinedData.length) * 100) / 100;
  }, [combinedData]);

  const avgTestScore = useMemo(() => {
    const scores = Object.values(testScoreByStudent);
    if (!scores.length) return 0;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
  }, [testScoreByStudent]);

  const testDistribution = useMemo(() => {
    const scores = Object.values(testScoreByStudent);
    return {
      below50: scores.filter(s => s < 50).length,
      mid: scores.filter(s => s >= 50 && s < 75).length,
      above75: scores.filter(s => s >= 75).length,
      total: scores.length,
    };
  }, [testScoreByStudent]);

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return '#d7b48f';
    if (percentage >= 50) return '#6b4c3b';
    return '#4a3a2c';
  };

  const CircleStat = ({ value, label }) => {
    const r = 40;
    const circumference = 2 * Math.PI * r;
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <svg width="90" height="90" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={r} stroke="#e7c6a5" strokeWidth="8" fill="none" />
            <circle
              cx="50" cy="50" r={r}
              stroke={getAttendanceColor(value)}
              strokeWidth="8" fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (value / 100) * circumference}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <div className="text-base font-bold leading-tight text-[#4a3a2c]">{value}%</div>
              <div className="text-[9px] text-[#6b4c3b]">{label}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleStudentDisplay = (std) => {
    setShowStudentProfile({ show: true, student: std });
  };

  const renderDropdown = (value, setValue, options, placeholder, disabled = false) => (
      <Dropdown
          compact
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          options={[
              { label: placeholder, value: "" },
              ...options.map((opt) =>
                  typeof opt === 'object'
                      ? { label: opt.name, value: opt.name }
                      : { label: opt, value: opt }
              )
          ]}
      />
  );

  if (showStudentProfile.show) {
    return <StudentProfile student={showStudentProfile} setShowStudentProfile={setShowStudentProfile} />;
  }

  return (
      <div className="flex flex-col xl:flex-row gap-4 p-4 overflow-hidden w-full h-full">
        {/* Left Panel */}
        <div className="flex flex-col sm:flex-row xl:flex-col gap-3 xl:w-[30%] xl:shrink-0 xl:overflow-y-auto xl:no-scrollbar">
          {/* Avg Marks */}
          <div className="flex-1 xl:flex-none min-w-0">
            <Card className="w-full bg-[#f8ede3] text-[#4a3a2c] p-5 rounded-2xl flex flex-col gap-4 border border-[#ddb892]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Avg. Test Score</h2>
                <span className="text-xs text-[#6b4c3b] bg-[#f0d9c0] px-2 py-1 rounded-full">
                  {testDistribution.total} student{testDistribution.total !== 1 ? 's' : ''} with data
                </span>
              </div>
              {testDistribution.total === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-[#6b4c3b] gap-2">
                  <span className="text-3xl">📋</span>
                  <p>No test results recorded yet</p>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <CircleStat value={avgTestScore} label="Overall" />
                    <p className="text-xs text-[#6b4c3b] text-center">across all tests</p>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    {[
                      { label: 'Below 50%', count: testDistribution.below50, bg: 'bg-red-50', bar: 'bg-red-400', text: 'text-red-700' },
                      { label: '50% – 75%', count: testDistribution.mid,     bg: 'bg-yellow-50', bar: 'bg-yellow-400', text: 'text-yellow-700' },
                      { label: 'Above 75%', count: testDistribution.above75, bg: 'bg-green-50', bar: 'bg-green-400', text: 'text-green-700' },
                    ].map(({ label, count, bg, bar, text }) => (
                      <div key={label} className={`${bg} px-3 py-2 rounded-xl`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-semibold ${text}`}>{label}</span>
                          <span className={`text-sm font-bold ${text}`}>{count}</span>
                        </div>
                        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bar} rounded-full transition-all duration-700`}
                            style={{ width: testDistribution.total > 0 ? `${(count / testDistribution.total) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Avg Attendance */}
          <div className="flex-1 xl:flex-none min-w-0">
            <Card className="w-full bg-[#f8ede3] text-[#4a3a2c] p-5 rounded-2xl flex flex-col gap-4 border border-[#ddb892]">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-base font-semibold">Avg. Attendance</h2>
                <div className="flex gap-1">
                  <div className="w-28">{renderDropdown(batchName, (v) => { setBatchName(v); setSubjectName(''); }, batches, "All Batches", isLoadingBatches)}</div>
                  <div className="w-28">{renderDropdown(subjectName, setSubjectName, batches.find((b) => b.name === batchName)?.subject || [], "All Subjects", !batchName)}</div>
                </div>
              </div>
              {isLoadingBatches ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="animate-spin w-4 h-4 mr-2" /> Loading...</div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <CircleStat value={avgAttendance} label="Overall" />
                    <p className="text-xs text-[#6b4c3b] text-center">{combinedData.length} students</p>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    {[
                      { label: 'Below 50%', count: combinedData.filter(s => s.percentage < 50).length,                                    bg: 'bg-red-50',    bar: 'bg-red-400',    text: 'text-red-700' },
                      { label: '50% – 75%', count: combinedData.filter(s => s.percentage >= 50 && s.percentage < 75).length,              bg: 'bg-yellow-50', bar: 'bg-yellow-400', text: 'text-yellow-700' },
                      { label: 'Above 75%', count: combinedData.filter(s => s.percentage >= 75).length,                                   bg: 'bg-green-50',  bar: 'bg-green-400',  text: 'text-green-700' },
                    ].map(({ label, count, bg, bar, text }) => (
                      <div key={label} className={`${bg} px-3 py-2 rounded-xl`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-semibold ${text}`}>{label}</span>
                          <span className={`text-sm font-bold ${text}`}>{count}</span>
                        </div>
                        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bar} rounded-full transition-all duration-700`}
                            style={{ width: combinedData.length > 0 ? `${(count / combinedData.length) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 min-w-0 min-h-0">
          <WrapperCard>
            <div className="bg-[#f8ede3] rounded-3xl overflow-hidden flex flex-col h-full border border-[#ddb892]">

              {/* Header */}
              <div className="px-6 py-4 bg-[#f0d9c0] border-b border-[#e6c8a8]">
                <h2 className="text-xl font-semibold text-[#5a4a3c]">Students</h2>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 p-4 border-b border-[#e6c8a8] bg-[#f8ede3]">
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Batch</label>
                  <Dropdown
                    value={batchName}
                    onChange={(e) => { setBatchName(e.target.value); setSubjectName(''); }}
                    disabled={isLoadingBatches}
                    options={[
                        { label: "All Batches", value: "" },
                        ...batches.map(b => ({ label: b.name, value: b.name }))
                    ]}
                  />
                </div>
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Subject</label>
                  <Dropdown
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    disabled={!batchName}
                    options={[
                        { label: "All Subjects", value: "" },
                        ...(batches.find((b) => b.name === batchName)?.subject || []).map(s => ({ label: s.name, value: s.name }))
                    ]}
                  />
                </div>
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Grade</label>
                  <Dropdown
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    options={[
                        { label: "All Grades", value: "" },
                        ...uniqueGrades.map(g => ({ label: `Class ${g}`, value: g }))
                    ]}
                  />
                </div>
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-xs font-semibold text-[#7b5c4b] uppercase mb-1">Attendance</label>
                  <Dropdown
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    options={[
                        { label: "All", value: "" },
                        { label: "Above 50%", value: ">50" },
                        { label: "Below 50%", value: "<50" }
                    ]}
                  />
                </div>
              </div>

              {/* Scrollable table body only */}
              <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar">
                {isLoadingBatches || loadingAttendance ? (
                  <div className="flex items-center justify-center h-full text-[#6b4c3b]">
                    <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading data...
                  </div>
                ) : (
                  <table className="min-w-[700px] w-full divide-y divide-[#e6c8a8]">
                    <thead className="bg-[#f0d9c0] sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Batch</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Subjects</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Attendance</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Avg Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">School</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#7b5c4b] uppercase tracking-wider">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#f8ede3] divide-y divide-[#e6c8a8]">
                      {pagedData.length > 0 ? (
                        pagedData.map((student, index) => (
                          <tr key={student.studentId} className="hover:bg-[#f0d9c0] transition-colors">
                            <td className="px-4 py-3 text-sm text-[#5a4a3c]">{(safePage - 1) * PAGE_SIZE + index + 1}</td>
                            <td
                              className="px-4 py-3 text-sm font-medium text-[#5a4a3c] cursor-pointer hover:underline hover:text-[#8b5e3c]"
                              onClick={() => handleStudentDisplay(student)}
                            >
                              {student.studentName}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#5a4a3c]">{student.grade}</td>
                            <td className="px-4 py-3 text-sm text-[#5a4a3c]">{student.batchName}</td>
                            <td className="px-4 py-3 text-sm text-[#5a4a3c]">{student.subjects}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                student.percentage >= 75 ? 'bg-green-100 text-green-700' :
                                student.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {student.percentage}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              {testScoreByStudent[student.studentId?.toString()] != null ? (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  testScoreByStudent[student.studentId?.toString()] >= 75 ? 'bg-green-100 text-green-700' :
                                  testScoreByStudent[student.studentId?.toString()] >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {testScoreByStudent[student.studentId?.toString()]}%
                                </span>
                              ) : (
                                <span className="text-xs text-[#b0998a]">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#5a4a3c]">{student.school_name}</td>
                            <td className="px-4 py-3 text-sm text-[#5a4a3c]">{student.contact_info?.phoneNumbers?.student || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-4 py-10 text-center text-sm text-[#6b4c3b]">
                            No students match the current filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e6c8a8] bg-[#f8ede3] shrink-0">
                  <span className="text-xs text-[#7b5c4b]">
                    {filteredData.length} students · Page {safePage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="px-2.5 py-1 text-xs rounded-lg border border-[#e6c8a8] bg-[#f0d9c0] text-[#5a4a3c] hover:bg-[#e0c4a8] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                      .reduce((acc, p, i, arr) => {
                        if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) => p === '…' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-xs text-[#7b5c4b]">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 text-xs rounded-lg border transition ${
                            p === safePage
                              ? 'bg-[#8b5e3c] text-white border-[#8b5e3c]'
                              : 'border-[#e6c8a8] bg-[#f0d9c0] text-[#5a4a3c] hover:bg-[#e0c4a8]'
                          }`}
                        >
                          {p}
                        </button>
                      ))
                    }
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="px-2.5 py-1 text-xs rounded-lg border border-[#e6c8a8] bg-[#f0d9c0] text-[#5a4a3c] hover:bg-[#e0c4a8] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              </div>

            </div>
          </WrapperCard>
        </div>
      </div>
  );
};

export default CompleteInformationDisplay;