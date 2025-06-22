import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import useGetBatchId from "./hooks/useGetBatchId.js";
import editStudentAttendance from "./hooks/editStudentAttendence.jsx";
import { getTotalClasses } from "@/pages/Attendence/hooks/getTotalClasses.jsx";
import useFetchAllBatch from "@/pages/BatchPage/Functions/useFetchAllBatch.jsx";

const AttendancePage = () => {
  const [batchName, setBatchName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [date, setDate] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [allStudentsList, setAllStudentsList] = useState([]);
  const [fetchedStudents, setFetchedStudents] = useState([]);
  const [presentStudentIds, setPresentStudentIds] = useState(new Set());
  const [alreadyPresentStudents, setAlreadyPresentStudents] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [totalClassesCount, setTotalClassesCount] = useState(0);

  const { batchId, subjectId } = useGetBatchId(batchName, subjectName);

  useEffect(() => {
    useFetchAllBatch()
      .then((res) => setBatches(res || []))
      .catch(() => setBatches([]));
  }, []);

  useEffect(() => {
    const matched = batches.find(b => b.name === batchName);
    setSelectedBatch(matched || null);
  }, [batchName, batches]);

  useEffect(() => {
    if (batchId && subjectId && isTodaySelected()) {
      fetchAllStudents();
      fetchTotalClasses();
    } else {
      setAllStudentsList([]);
      setFetchedStudents([]);
      setPresentStudentIds(new Set());
      setAlreadyPresentStudents([]);
      setTotalClassesCount(0);
    }
  }, [batchId, subjectId, date]);

  const isTodaySelected = () => {
    const selected = new Date(date);
    const now = new Date();
    return selected.toDateString() === now.toDateString();
  };

  const isSubjectScheduledToday = () => {
    if (!selectedBatch || !subjectName || !date) return false;
    const day = new Date(date).toLocaleString("en-US", { weekday: "long" });
    const subject = selectedBatch.subject.find(s => s.name === subjectName);
    return subject?.classSchedule.some(sch => sch.days.includes(day));
  };

  const togglePresent = (studentId) => {
    setPresentStudentIds((prev) => {
      const updated = new Set(prev);
      updated.has(studentId) ? updated.delete(studentId) : updated.add(studentId);
      return updated;
    });
  };

  const fetchTotalClasses = async () => {
    try {
      const count = await getTotalClasses(batchId, subjectId);
      setTotalClassesCount(count);
    } catch {
      setTotalClassesCount(0);
    }
  };

  const fetchAllStudents = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
      const students = res.data || [];
      const formattedDate = new Date(date).toISOString().split("T")[0];

      const alreadyMarkedPresent = [];
      const alreadyMarkedIds = new Set();

      for (const student of students) {
        const isPresent = (student.attendance || []).some(record => {
          const datePart = new Date(record.date).toISOString().split("T")[0];
          return datePart === formattedDate && record.subject === subjectId;
        });
        if (isPresent) {
          alreadyMarkedPresent.push({ student, time: "Marked" });
          alreadyMarkedIds.add(student._id);
        }
      }

      setAllStudentsList(students);
      setAlreadyPresentStudents(alreadyMarkedPresent);
      setFetchedStudents(students.filter(s => !alreadyMarkedIds.has(s._id)));
    } catch {
      setError("Failed to fetch students.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAttendance = async () => {
    setFormTouched(true);
    setError("");

    if (!batchName || !subjectName || !date) return setError("All fields are required.");

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return setError("Cannot mark attendance for past dates.");
    }

    if (!isSubjectScheduledToday()) {
      return setError("Class not scheduled for selected subject today.");
    }

    if (presentStudentIds.size === 0) {
      return alert("No students marked present.");
    }

    try {
      const errors = await editStudentAttendance(
        Array.from(presentStudentIds),
        subjectId,
        batchId,
        date
      );

      if (errors.length === 0) {
        alert("Attendance submitted successfully!");
        await fetchAllStudents();
        setPresentStudentIds(new Set());
      } else {
        setError("Some attendance records failed.");
      }
    } catch {
      setError("Failed to submit attendance.");
    }
  };

  const clearForm = () => {
    setBatchName("");
    setSubjectName("");
    setDate("");
    setAllStudentsList([]);
    setFetchedStudents([]);
    setPresentStudentIds(new Set());
    setAlreadyPresentStudents([]);
    setError("");
    setFormTouched(false);
    setIsLoading(false);
    setTotalClassesCount(0);
  };

  return (
    <div className="min-h-screen w-screen bg-[#d3a781] text-white flex justify-center items-start overflow-hidden">
      <div className="bg-[#fee5cf] relative w-full min-h-[95vh] rounded-[2rem] bg-[#e7c6a5] border border-[#e0b890] shadow-2xl overflow-hidden flex mx-2 my-4">
        
        <SideBar />
        
        <div className="flex flex-col w-full overflow-hidden">
          <Navbar />
          <div className="flex flex-col gap-4 p-4 flex-1 overflow-hidden">
            <div className="flex gap-4 flex-1 overflow-hidden">
              <div className="flex flex-col w-1/2 gap-4 bg-white/70 rounded-2xl p-4 text-black shadow-md overflow-y-auto">
                <h2 className="text-lg font-bold mb-2">Overall Attendance Summary</h2>
                <ul className="flex flex-wrap gap-2">
                  {allStudentsList.map((student) => {
                    const subjectAttendance = (student.attendance || []).filter(
                      record => record.subject === subjectId
                    );
                    const presentCount = subjectAttendance.filter(record => record.present).length;
                    const percentage = totalClassesCount > 0
                      ? Math.round((presentCount / totalClassesCount) * 100)
                      : 0;
                    return (
                      <li key={student._id} className="flex flex-col justify-center items-center border rounded-lg p-2 w-[7em]">
                        <span>{student.name}</span>
                        <span className="font-semibold">{percentage}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex flex-col w-1/2 gap-3 bg-white/70 rounded-2xl p-4 text-black shadow-md">
                <select value={batchName} onChange={(e) => setBatchName(e.target.value)} className="border p-2 rounded-md">
                  <option value="">Select Batch</option>
                  {(batches || []).map((b, i) => (
                    <option key={i} value={b.name}>{b.name}</option>
                  ))}
                </select>

                <select value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="border p-2 rounded-md">
                  <option value="">Select Subject</option>
                  {selectedBatch?.subject.map((s, i) => (
                    <option key={i} value={s.name}>{s.name}</option>
                  ))}
                </select>

                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded-md" />
                
                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex gap-2">
                  <button onClick={fetchAllStudents} className="bg-blue-500 text-white p-2 rounded-md w-1/2">Search</button>
                  <button onClick={clearForm} className="bg-gray-400 text-white p-2 rounded-md w-1/2">Clear</button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-1 overflow-hidden">
              <div className="w-1/2 bg-white/80 text-black rounded-xl p-4 overflow-y-auto">
                <div className="flex justify-between mb-2">
                  <h2 className="font-bold">All Students in Batch</h2>
                  <button onClick={submitAttendance} className="bg-green-600 text-white px-4 py-2 rounded-md">Submit</button>
                </div>
                {fetchedStudents.map((student, i) => (
                  <div key={student._id} className="border p-3 rounded-md mb-2 flex justify-between items-center">
                    <span>{i + 1}. {student.name}</span>
                    <button onClick={() => togglePresent(student._id)} className={`w-8 h-8 border rounded-full flex items-center justify-center ${presentStudentIds.has(student._id) ? "bg-green-500 text-white" : "bg-white text-black"}`}>
                      {presentStudentIds.has(student._id) ? "✓" : ""}
                    </button>
                  </div>
                ))}
              </div>

              <div className="w-1/2 bg-white/80 text-black rounded-xl p-4 overflow-y-auto">
                <h2 className="font-bold mb-2">Already Marked Present on {date || "N/A"}</h2>
                {alreadyPresentStudents.map((entry, i) => (
                  <div key={entry.student._id} className="border p-3 rounded-md mb-2 flex justify-between items-center">
                    <span>{i + 1}. {entry.student.name}</span>
                    <span className="text-green-700 font-bold">{entry.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
